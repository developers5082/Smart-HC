// pages/BlogDetail.jsx - Individual blog view with comments
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { blogsAPI, commentsAPI } from '../services/api';

const BlogDetail = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/blog');
  };

  useEffect(() => {
    fetchBlogAndComments();
  }, [id]);

  const fetchBlogAndComments = async () => {
    try {
      setLoading(true);
      setError('');
      const [blogResponse, commentsResponse] = await Promise.all([
        blogsAPI.getById(id),
        commentsAPI.getByBlogId(id)
      ]);
      setBlog(blogResponse.data.data);
      setComments(commentsResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError(error.response?.data?.message || 'Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeBlog = async () => {
    if (!user) return;
    try {
      await blogsAPI.like(id);
      // Refresh blog data
      const response = await blogsAPI.getById(id);
      setBlog(response.data.data);
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      await commentsAPI.create(id, { content: newComment.trim() });
      setNewComment('');
      // Refresh comments
      const response = await commentsAPI.getByBlogId(id);
      setComments(response.data.data || []);
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) return;
    try {
      await commentsAPI.like(commentId);
      // Refresh comments
      const response = await commentsAPI.getByBlogId(id);
      setComments(response.data.data || []);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleReply = async (commentId) => {
    if (!user || !replyContent.trim()) return;

    setSubmitting(true);
    try {
      await commentsAPI.addReply(commentId, { content: replyContent.trim() });
      setReplyContent('');
      setReplyingTo(null);
      // Refresh comments
      const response = await commentsAPI.getByBlogId(id);
      setComments(response.data.data || []);
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Blog Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link to="/blog" className="text-blue-600 hover:text-blue-800">
              ← Back to Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/blog" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back to Blogs
            </Link>
            
            {/* Navigation Menu */}
            {!user ? (
              // Not logged in - Show only Sign In button
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              // Logged in - Show user menu
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <nav className="flex items-center space-x-4">
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/appointments"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Appointments
                  </Link>
                  {user.role === 'patient' && (
                    <Link
                      to="/prescriptions"
                      className="text-gray-700 hover:text-blue-600 font-medium"
                    >
                      Prescriptions
                    </Link>
                  )}
                  {user.role === 'doctor' && (
                    <Link
                      to="/create-blog"
                      className="text-gray-700 hover:text-blue-600 font-medium"
                    >
                      Enter Blog
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Blog Content */}
        <article className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="h-64 md:h-96 overflow-hidden">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-blog.jpg';
              }}
            />
          </div>
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {blog.category}
              </span>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{blog.views} views</span>
                <span>{blog.likes?.length || 0} likes</span>
                <span>{comments.length} comments</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{blog.title}</h1>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-gray-600">By {blog.authorName}</span>
                {blog.authorRole === 'doctor' && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Doctor
                  </span>
                )}
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">{formatDate(blog.createdAt)}</span>
              </div>
              {user && (
                <button
                  onClick={handleLikeBlog}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                    blog.likes?.some(like => like.user === user._id)
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>❤️</span>
                  <span>{blog.likes?.length || 0}</span>
                </button>
              )}
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {blog.description}
              </p>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Comments ({comments.length})
          </h2>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
              <p className="text-gray-600">
                Please <Link to="/login" className="text-blue-600 hover:text-blue-800">sign in</Link> to comment on this blog.
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-800">
                        {comment.authorName}
                      </span>
                      {comment.authorRole === 'doctor' && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Doctor
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{comment.content}</p>
                    <div className="flex items-center space-x-4">
                      {user && (
                        <>
                          <button
                            onClick={() => handleLikeComment(comment._id)}
                            className={`flex items-center space-x-1 text-sm ${
                              comment.likes?.some(like => like.user === user._id)
                                ? 'text-red-600'
                                : 'text-gray-500 hover:text-red-600'
                            }`}
                          >
                            <span>👍</span>
                            <span>{comment.likes?.length || 0}</span>
                          </button>
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                            className="text-sm text-gray-500 hover:text-blue-600"
                          >
                            Reply
                          </button>
                        </>
                      )}
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment._id && user && (
                      <div className="mt-4 ml-8">
                        <div className="flex space-x-3">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            rows={2}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                          />
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => handleReply(comment._id)}
                              disabled={submitting || !replyContent.trim()}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {submitting ? '...' : 'Reply'}
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                              }}
                              className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 ml-8 space-y-3">
                        {comment.replies.map((reply, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-semibold text-sm text-gray-800">
                                {reply.authorName}
                              </span>
                              {reply.authorRole === 'doctor' && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Doctor
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {comments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;