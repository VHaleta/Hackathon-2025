import { Search, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ArticleCard from './ArticleCard';
import { fetchArticles } from '@/services/mockData';

function MainPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load initial articles on mount
  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async (query = '') => {
    setLoading(true);
    try {
      const data = await fetchArticles(query);
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setHasSearched(true);
    await loadArticles(searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Space Biology Knowledge Engine
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Start your search journey here
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full mb-12">
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Enter your search query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 h-14 text-lg"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </Button>
            </div>
          </form>

          {/* Results Section */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : articles.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Found {articles.length} {articles.length === 1 ? 'article' : 'articles'}
                {hasSearched && searchQuery && ` for "${searchQuery}"`}
              </div>
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          ) : hasSearched ? (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                No articles found for "{searchQuery}"
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default MainPage;