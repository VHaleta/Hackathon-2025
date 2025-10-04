// PubMed Central API service for fetching article data

// NCBI E-utilities API endpoints
const EFETCH_API = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';
const ESUMMARY_API = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';

/**
 * Extract PMC ID from URL
 * Example: https://pmc.ncbi.nlm.nih.gov/articles/PMC4136787/ -> 4136787
 * Example: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4136787/ -> 4136787
 */
export const extractPmcId = (url) => {
  const match = url.match(/PMC(\d+)/);
  return match ? match[1] : null; // Return just the number without PMC prefix
};

/**
 * Fetch article summary using E-utilities ESummary
 */
export const fetchArticleSummary = async (pmcId) => {
  try {
    const url = `${ESUMMARY_API}?db=pmc&id=${pmcId}&retmode=json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch article summary');
    }

    const data = await response.json();
    return data.result?.[pmcId] || null;
  } catch (error) {
    console.error('Error fetching article summary:', error);
    throw error;
  }
};

/**
 * Fetch article full text using E-utilities EFetch
 */
export const fetchArticleFullText = async (pmcId) => {
  try {
    // Try to fetch full text as XML
    const url = `${EFETCH_API}?db=pmc&id=${pmcId}&retmode=xml`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch full text');
    }

    const xmlText = await response.text();
    return xmlText;
  } catch (error) {
    console.error('Error fetching full text:', error);
    throw error;
  }
};

/**
 * Fetch figure image URLs from PMC HTML page
 */
export const fetchFigureUrls = async (pmcId) => {
  try {
    const url = `https://pmc.ncbi.nlm.nih.gov/articles/PMC${pmcId}/`;
    console.log('Fetching HTML from:', url);

    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PMC page: ${response.status}`);
    }

    const htmlText = await response.text();
    console.log('Received HTML, length:', htmlText.length);

    // Use regex to extract CDN image URLs
    const figureUrls = {};
    const urlPattern = /https:\/\/cdn\.ncbi\.nlm\.nih\.gov\/pmc\/blobs\/[^"'\s]+\.(jpg|png|gif)/g;
    const matches = htmlText.match(urlPattern) || [];

    console.log('Found image URLs:', matches.length);

    matches.forEach(url => {
      // Extract filename from URL to use as key
      const filenameMatch = url.match(/([^\/]+\.(jpg|png|gif))$/);
      if (filenameMatch) {
        const filename = filenameMatch[1];
        figureUrls[filename] = url;
        console.log('Mapped:', filename, '->', url);
      }
    });

    console.log('Extracted figure URLs:', figureUrls);
    return figureUrls;
  } catch (error) {
    console.error('Error fetching figure URLs:', error);
    return {};
  }
};

/**
 * Parse PMC XML to readable sections with better formatting
 */
export const parsePmcXml = (xmlText, pmcIdFromUrl = null, figureUrls = {}) => {
  if (!xmlText) {
    return null;
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    console.error('XML parsing error:', parserError.textContent);
    return null;
  }

  const sections = [];

  // Get article metadata
  const articleMeta = {
    title: '',
    authors: [],
    journal: '',
    pubDate: '',
    doi: '',
    pmcId: ''
  };

  // Extract PMC ID from article-id, or use the one from URL
  const pmcIdElement = xmlDoc.querySelector('article-id[pub-id-type="pmc"]');
  if (pmcIdElement) {
    articleMeta.pmcId = pmcIdElement.textContent.trim();
  } else if (pmcIdFromUrl) {
    articleMeta.pmcId = pmcIdFromUrl;
    console.log('Using PMC ID from URL in XML parser:', pmcIdFromUrl);
  }

  // Extract title
  const titleElement = xmlDoc.querySelector('article-title');
  if (titleElement) {
    articleMeta.title = titleElement.textContent.trim();
  }

  // Extract authors
  const contribGroup = xmlDoc.querySelectorAll('contrib[contrib-type="author"]');
  contribGroup.forEach(contrib => {
    const givenNames = contrib.querySelector('given-names')?.textContent || '';
    const surname = contrib.querySelector('surname')?.textContent || '';
    if (surname) {
      articleMeta.authors.push(`${givenNames} ${surname}`.trim());
    }
  });

  // Extract journal info
  const journalTitle = xmlDoc.querySelector('journal-title');
  if (journalTitle) {
    articleMeta.journal = journalTitle.textContent.trim();
  }

  // Extract publication date
  const pubDate = xmlDoc.querySelector('pub-date[pub-type="epub"], pub-date[pub-type="ppub"]');
  if (pubDate) {
    const year = pubDate.querySelector('year')?.textContent || '';
    const month = pubDate.querySelector('month')?.textContent || '';
    const day = pubDate.querySelector('day')?.textContent || '';
    articleMeta.pubDate = [year, month, day].filter(Boolean).join('-');
  }

  // Extract DOI
  const doi = xmlDoc.querySelector('article-id[pub-id-type="doi"]');
  if (doi) {
    articleMeta.doi = doi.textContent.trim();
  }

  // Get abstract with subsections
  const abstractElement = xmlDoc.querySelector('abstract');
  if (abstractElement) {
    const abstractSections = [];

    // Check if abstract has subsections
    const abstractSecs = abstractElement.querySelectorAll('sec');
    if (abstractSecs.length > 0) {
      abstractSecs.forEach(sec => {
        const secTitle = sec.querySelector('title')?.textContent || '';
        const paragraphs = Array.from(sec.querySelectorAll('p'))
          .map(p => p.textContent.trim())
          .filter(Boolean);

        if (paragraphs.length > 0) {
          abstractSections.push({
            subtitle: secTitle,
            paragraphs: paragraphs
          });
        }
      });
    } else {
      // Simple abstract without subsections
      const paragraphs = Array.from(abstractElement.querySelectorAll('p'))
        .map(p => p.textContent.trim())
        .filter(Boolean);

      if (paragraphs.length > 0) {
        abstractSections.push({
          subtitle: '',
          paragraphs: paragraphs
        });
      }
    }

    if (abstractSections.length > 0) {
      sections.push({
        type: 'abstract',
        title: 'Abstract',
        subsections: abstractSections
      });
    }
  }

  // Recursive function to parse sections and subsections
  const parseSection = (secElement) => {
    const titleEl = secElement.querySelector(':scope > title');
    const title = titleEl ? titleEl.textContent.trim() : '';

    const subsections = [];

    // Get direct paragraphs (not nested in subsections)
    const directParas = Array.from(secElement.querySelectorAll(':scope > p'))
      .map(p => p.textContent.trim())
      .filter(Boolean);

    if (directParas.length > 0) {
      subsections.push({
        subtitle: '',
        paragraphs: directParas
      });
    }

    // Get nested subsections
    const nestedSecs = secElement.querySelectorAll(':scope > sec');
    nestedSecs.forEach(nestedSec => {
      const subTitle = nestedSec.querySelector(':scope > title')?.textContent.trim() || '';
      const subParas = Array.from(nestedSec.querySelectorAll(':scope > p'))
        .map(p => p.textContent.trim())
        .filter(Boolean);

      if (subParas.length > 0) {
        subsections.push({
          subtitle: subTitle,
          paragraphs: subParas
        });
      }
    });

    return {
      type: 'section',
      title: title,
      subsections: subsections
    };
  };

  // Get body sections
  const bodySections = xmlDoc.querySelectorAll('body > sec');
  bodySections.forEach(sec => {
    const section = parseSection(sec);
    if (section.subsections.length > 0) {
      sections.push(section);
    }
  });

  // Extract figures
  const figures = [];
  const figElements = xmlDoc.querySelectorAll('fig');

  console.log('Found figures:', figElements.length);

  figElements.forEach((fig, index) => {
    const figId = fig.getAttribute('id') || `fig-${index + 1}`;
    const label = fig.querySelector('label')?.textContent || '';
    const caption = fig.querySelector('caption p')?.textContent || '';

    // Get graphic href (image filename)
    const graphics = fig.querySelectorAll('graphic');

    console.log(`Figure ${index + 1}:`, {
      id: figId,
      label: label,
      graphicsCount: graphics.length
    });

    graphics.forEach((graphic, gIdx) => {
      // Try different attribute names
      let href = graphic.getAttribute('xlink:href')
                || graphic.getAttribute('href')
                || graphic.getAttributeNS('http://www.w3.org/1999/xlink', 'href');

      console.log(`  Graphic ${gIdx}:`, {
        'xlink:href': graphic.getAttribute('xlink:href'),
        'href': graphic.getAttribute('href'),
        'all attributes': Array.from(graphic.attributes).map(attr => `${attr.name}=${attr.value}`)
      });

      if (href) {
        const pmcId = articleMeta.pmcId || '';

        if (!pmcId) {
          console.warn('PMC ID is empty! Cannot generate image URLs.');
          return;
        }

        // Check if we have CDN URL for this image
        const cdnUrl = figureUrls[href];

        if (cdnUrl) {
          console.log('Found CDN URL for', href, ':', cdnUrl);
          figures.push({
            id: figId,
            label: label,
            caption: caption,
            imageUrl: cdnUrl,
            pmcId: pmcId,
            href: href
          });
        } else {
          // Fallback: link to view on PMC website
          const figureId = figId.split('-').pop() || figId;
          const figureViewUrl = `https://pmc.ncbi.nlm.nih.gov/articles/PMC${pmcId}/figure/${figureId}/`;

          console.log('No CDN URL found for', href, ', using view URL');
          figures.push({
            id: figId,
            label: label,
            caption: caption,
            viewUrl: figureViewUrl,
            pmcId: pmcId,
            href: href
          });
        }
      }
    });
  });

  return {
    sections,
    metadata: articleMeta,
    figures: figures
  };
};

/**
 * Get article content using E-utilities
 */
export const getArticleContent = async (articleUrl) => {
  const pmcIdFromUrl = extractPmcId(articleUrl);

  if (!pmcIdFromUrl) {
    return {
      available: false,
      message: 'Not a PMC article',
      originalUrl: articleUrl
    };
  }

  try {
    // Fetch figure URLs from HTML page and full text XML in parallel
    const [figureUrls, xmlText] = await Promise.all([
      fetchFigureUrls(pmcIdFromUrl),
      fetchArticleFullText(pmcIdFromUrl)
    ]);

    const parsed = parsePmcXml(xmlText, pmcIdFromUrl, figureUrls);

    if (parsed && parsed.sections.length > 0) {
      return {
        available: true,
        pmcId: pmcIdFromUrl,
        content: parsed,
        originalUrl: articleUrl
      };
    }

    // Fallback: try to get summary
    const summary = await fetchArticleSummary(pmcIdFromUrl);
    return {
      available: false,
      pmcId: pmcIdFromUrl,
      metadata: summary,
      message: 'Full text could not be parsed. Please view on PMC website.',
      originalUrl: articleUrl
    };

  } catch (error) {
    console.error('Error getting article content:', error);
    return {
      available: false,
      pmcId: pmcIdFromUrl,
      error: error.message,
      message: 'Unable to fetch article content. Please view on PMC website.',
      originalUrl: articleUrl
    };
  }
};