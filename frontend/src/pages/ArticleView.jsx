import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, User, Tag, ExternalLink, Loader2, AlertCircle, BookOpen, ImageIcon } from 'lucide-react';
import { fetchArticleById } from '@/services/mockData';
import { getArticleContent } from '@/services/pmcApi';

// Component to try multiple image URLs
function FigureImage({ figure }) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    if (currentUrlIndex < figure.imageUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
    } else {
      setImageError(true);
    }
  };

  if (imageError) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6">
        <div className="flex items-center justify-center h-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-3">
          <div className="text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Image not available
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {figure.href}
            </p>
          </div>
        </div>
        {figure.label && (
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {figure.label}
          </p>
        )}
        {figure.caption && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {figure.caption}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6">
      <div className="mb-3">
        <img
          src={figure.imageUrls[currentUrlIndex]}
          alt={figure.label}
          className="w-full h-auto rounded-lg shadow-md"
          onError={handleImageError}
        />
      </div>
      {figure.label && (
        <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {figure.label}
        </p>
      )}
      {figure.caption && (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {figure.caption}
        </p>
      )}
    </div>
  );
}

function ArticleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [articleContent, setArticleContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      try {
        const data = await fetchArticleById(id);
        setArticle(data);

        // Try to fetch PMC content
        if (data && data.url) {
          setContentLoading(true);
          try {
            const content = await getArticleContent(data.url);
            setArticleContent(content);
          } catch (error) {
            console.error('Error fetching article content:', error);
          } finally {
            setContentLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Article not found
            </h1>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Article Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {article.title}
              </CardTitle>
              <CardDescription className="text-base mt-3">
                {article.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(article.date).toLocaleDateString()}</span>
                </div>
              </div>
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-start gap-2">
                  <Tag className="h-4 w-4 mt-0.5 text-slate-400" />
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open original source
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Article Content */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Article Content
              </CardTitle>
              {articleContent?.available && (
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400"></span>
                  Open Access
                </span>
              )}
            </CardHeader>
            <CardContent>
              {contentLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : articleContent?.available ? (
                <div className="max-w-none">
                  {/* Article Metadata */}
                  {articleContent.content.metadata && (
                    <div className="mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
                      {articleContent.content.metadata.title && (
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                          {articleContent.content.metadata.title}
                        </h1>
                      )}
                      {articleContent.content.metadata.authors.length > 0 && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          <span className="font-semibold">Authors:</span> {articleContent.content.metadata.authors.join(', ')}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                        {articleContent.content.metadata.journal && (
                          <span><span className="font-semibold">Journal:</span> {articleContent.content.metadata.journal}</span>
                        )}
                        {articleContent.content.metadata.pubDate && (
                          <span><span className="font-semibold">Published:</span> {articleContent.content.metadata.pubDate}</span>
                        )}
                        {articleContent.content.metadata.doi && (
                          <span>
                            <span className="font-semibold">DOI:</span>{' '}
                            <a
                              href={`https://doi.org/${articleContent.content.metadata.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline dark:text-blue-400"
                            >
                              {articleContent.content.metadata.doi}
                            </a>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Article Sections */}
                  {articleContent.content.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-8">
                      {section.title && (
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                          {section.title}
                        </h2>
                      )}

                      {section.subsections && section.subsections.map((subsection, subIndex) => (
                        <div key={subIndex} className="mb-6">
                          {subsection.subtitle && (
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
                              {subsection.subtitle}
                            </h3>
                          )}
                          {subsection.paragraphs && subsection.paragraphs.map((para, paraIndex) => (
                            <p
                              key={paraIndex}
                              className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4 text-justify"
                            >
                              {para}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Figures Section */}
                  {articleContent.content.figures && articleContent.content.figures.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                        Figures
                      </h2>
                      <div className="space-y-6">
                        {articleContent.content.figures.map((figure, figIndex) => (
                          <FigureImage key={figIndex} figure={figure} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <Button asChild variant="outline">
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on PMC Website
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Full text not available
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
                    {articleContent?.message || 'This article is not available in Open Access format. Please view it on the original website.'}
                  </p>
                  <Button asChild>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open on PMC Website
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ArticleView;
