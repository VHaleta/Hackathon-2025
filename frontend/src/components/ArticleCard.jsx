import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, Tag } from 'lucide-react';

function ArticleCard({ article }) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {article.title}
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
          {article.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
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
          <div className="flex items-start gap-2 mt-3">
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
      </CardContent>
    </Card>
  );
}

export default ArticleCard;
