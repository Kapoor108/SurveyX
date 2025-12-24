import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const Blog = () => {
  const posts = [
    {
      title: '10 Tips for Creating Effective Employee Surveys',
      excerpt: 'Learn how to design surveys that get honest feedback and actionable insights from your team.',
      date: 'December 15, 2024',
      category: 'Best Practices',
      image: '📊'
    },
    {
      title: 'The Importance of Anonymous Feedback',
      excerpt: 'Why anonymous surveys lead to more honest responses and how to implement them effectively.',
      date: 'December 10, 2024',
      category: 'Employee Engagement',
      image: '🔒'
    },
    {
      title: 'How to Analyze Survey Results',
      excerpt: 'A comprehensive guide to understanding and acting on your survey data.',
      date: 'December 5, 2024',
      category: 'Analytics',
      image: '📈'
    },
    {
      title: 'Building a Feedback Culture',
      excerpt: 'Steps to create an organization where feedback is valued and acted upon.',
      date: 'November 28, 2024',
      category: 'Culture',
      image: '🌟'
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              SurveyPulse
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium">Back to Home</Link>
              <Link to="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">Sign In</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            SurveyPulse <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Blog</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Insights, tips, and best practices for employee engagement and feedback.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {posts.map((post, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-8">
                <div className="text-6xl mb-4">{post.image}</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">{post.category}</span>
                  <span className="text-sm text-gray-500">{post.date}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <button className="text-indigo-600 font-medium hover:text-indigo-700">
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">More articles coming soon!</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
