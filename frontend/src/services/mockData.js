// Mock data service - will be replaced with real API calls later
export const fetchArticles = async (query = '') => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockArticles = [
    {
      id: 1,
      title: "Effects of Microgravity on Cellular Biology",
      description: "Research findings on how reduced gravity environments affect cellular structure and function, including changes in gene expression and protein synthesis in space.",
      author: "Dr. Sarah Chen",
      date: "2025-09-15",
      tags: ["microgravity", "cell biology", "space medicine"]
    },
    {
      id: 2,
      title: "Plant Growth in Space Environments",
      description: "Comprehensive study of plant adaptation mechanisms in microgravity, covering phototropism, nutrient uptake, and potential applications for long-duration space missions.",
      author: "Dr. James Rodriguez",
      date: "2025-08-22",
      tags: ["plants", "agriculture", "ISS experiments"]
    },
    {
      id: 3,
      title: "Radiation Effects on Human DNA in Deep Space",
      description: "Analysis of cosmic radiation impact on astronaut DNA during extended missions beyond Earth's magnetosphere, with implications for Mars exploration.",
      author: "Dr. Emily Watson",
      date: "2025-07-10",
      tags: ["radiation", "DNA", "human health"]
    },
    {
      id: 4,
      title: "Bone Density Loss Prevention Strategies",
      description: "Novel approaches to combating bone density reduction in astronauts during long-term spaceflight, including exercise protocols and nutritional interventions.",
      author: "Dr. Michael Park",
      date: "2025-06-05",
      tags: ["bone health", "exercise", "nutrition"]
    },
    {
      id: 5,
      title: "Microbial Behavior in Closed Space Habitats",
      description: "Study of bacterial and fungal adaptation in controlled space station environments and implications for crew health and habitat maintenance.",
      author: "Dr. Lisa Anderson",
      date: "2025-05-18",
      tags: ["microbiome", "space station", "health monitoring"]
    },
    {
      id: 6,
      title: "Neural Plasticity During Spaceflight",
      description: "Investigation of how the brain adapts to microgravity conditions, including changes in spatial orientation, motor control, and cognitive function.",
      author: "Dr. Robert Kim",
      date: "2025-04-30",
      tags: ["neuroscience", "cognition", "adaptation"]
    }
  ];

  // Filter by query if provided
  if (query) {
    return mockArticles.filter(article =>
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.description.toLowerCase().includes(query.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  return mockArticles;
};
