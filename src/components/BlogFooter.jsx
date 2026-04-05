import React, { useState, useEffect } from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaPinterestP, FaYoutube } from 'react-icons/fa';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config/config';
import { getFullImageUrl } from '../utils/imageUtils';
import { useLanguage } from '../context/LanguageContext';

const API_BASE_URL = `${config.API_URL}`;

const Footer = () => {
  const { getLocalizedPath } = useLanguage();
  const [editorsPick, setEditorsPick] = useState([]);
  const [randomPosts, setRandomPosts] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        setLoading(true);

        // Fetch all data concurrently
        const [editorsResponse, randomResponse, allBlogsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/blogs/trending?limit=3`),
          axios.get(`${API_BASE_URL}/api/blogs?limit=3&sort=-publishedAt&status=published`),
          axios.get(`${API_BASE_URL}/api/blogs?status=published`)
        ]);

        // Set trending blogs for Editor's Pick
        const trendingList = Array.isArray(editorsResponse.data) ? editorsResponse.data : editorsResponse.data.blogs;
        setEditorsPick(Array.isArray(trendingList) ? trendingList : []);

        // Set latest blogs for Random Posts
        const latestBlogs = randomResponse.data.blogs || randomResponse.data || [];
        setRandomPosts(latestBlogs);

        // Get all published blogs and count categories
        const allBlogs = allBlogsResponse.data.blogs || allBlogsResponse.data || [];
        
        // Count blogs per category and store random blog slugs (using deepest category)
        const categoryCounts = {};
        allBlogs.forEach(blog => {
          const categoryId = blog.blogCategory?._id || blog.subCategory4?._id || blog.subCategory3?._id || 
                            blog.subCategory2?._id || blog.subCategory1?._id || 
                            blog.mainCategory?._id;
          const categoryName = blog.blogCategory?.name || blog.subCategory4?.name || blog.subCategory3?.name || 
                              blog.subCategory2?.name || blog.subCategory1?.name || 
                              blog.mainCategory?.name;
          
          if (categoryId && categoryName && blog.slug) {
            if (!categoryCounts[categoryId]) {
              categoryCounts[categoryId] = { _id: categoryId, name: categoryName, blogCount: 0, slugs: [] };
            }
            categoryCounts[categoryId].blogCount++;
            categoryCounts[categoryId].slugs.push(blog.slug);
          }
        });
        
        // Convert to array, add random slug for each, and sort by blog count
        const usedCategories = Object.values(categoryCounts).map(cat => {
          const randomSlug = cat.slugs[Math.floor(Math.random() * cat.slugs.length)];
          return { ...cat, randomBlogSlug: randomSlug };
        }).sort((a, b) => b.blogCount - a.blogCount);
        setPopularCategories(usedCategories);
      } catch (error) {
        console.error('Error fetching footer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  if (loading) {
    return (
  <footer className="bg-[#1f1f39] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-700 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    );
  }

  return (
  <footer className="bg-[#1f1f39] text-white pt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Editor's Pick Section */}
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">EDITOR'S PICK</h3>
              <div className="w-12 h-1 bg-pink-500"></div>
            </div>
            <div className="space-y-4">
              {editorsPick.slice(0, 3).map((post) => (
                <Link
                  key={post._id}
                  to={getLocalizedPath(`/blogs/${post.slug}`)}
                  className="flex gap-4 group transition-opacity"
                >
                  <div className="w-16 h-16 flex-shrink-0">
                    <img
                      src={post.mainImage ? getFullImageUrl(post.mainImage) : '/placeholder.svg?height=64&width=64'}
                      alt={post.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium leading-tight group-hover:text-lime-300 transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Random Posts Section */}
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">RANDOM POSTS</h3>
              <div className="w-12 h-1 bg-pink-500"></div>
            </div>
            <div className="space-y-4">
              {randomPosts.slice(0, 3).map((post) => (
                <Link
                  key={post._id}
                  to={getLocalizedPath(`/blogs/${post.slug}`)}
                  className="flex gap-4 group transition-opacity"
                >
                  <div className="w-16 h-16 flex-shrink-0">
                    <img
                      src={post.mainImage ? getFullImageUrl(post.mainImage) : '/placeholder.svg?height=64&width=64'}
                      alt={post.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium  group-hover:text-lime-300 ">
                      {post.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Categories Section */}
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">POPULAR CATEGORIES</h3>
              <div className="w-12 h-1 bg-orange-500"></div>
            </div>
            <div className="space-y-3">
              {popularCategories.slice(0, 5).map((category) => (
                <Link 
                  key={category._id} 
                  to={getLocalizedPath(`/blogs/${category.randomBlogSlug}`)}
                  className="flex items-center justify-between group p-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 transition-colors group-hover:text-lime-300"><strong>→</strong></span>
                    <span className="text-sm font-medium transition-colors group-hover:text-lime-300">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-xs text-white bg-gray-800 px-2 py-1 rounded">
                    ({category.blogCount || 0})
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Brand Spotlight */}
        <div className="border-t border-gray-800 mt-12 pt-5 text-center">
          <div className="flex flex-col items-center gap-5">
            {/* Logo (replace src with V Perfumes white logo path) */}
            <img
              src="/logo.png"
              alt="Grab– White Logo"
              className="h-14 w-auto opacity-90"
              loading="lazy"
            />

            <p className="text-sm md:text-base text-gray-300 max-w-3xl leading-relaxed">
              Graba2z is a UAE-based e-commerce platform specializing in premium tech products, including laptops, accessories, and gadgets. Established in 2025, it offers fast, secure delivery across the UAE through its user-friendly mobile app. Headquartered in Bur Dubai, Graba2z is committed to providing genuine products and exceptional customer service.
            </p>

            <div className="mt-2">
              <span className="sr-only">Follow Us</span>
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                {[
                  { name: 'Facebook', href: 'https://www.facebook.com/grabatozae/', Icon: FaFacebookF, color: '#1877F2' },
                  { name: 'X', href: 'https://x.com/GrabAtoz', Icon: FaXTwitter, color: '#000000' },
                  { name: 'Instagram', href: 'https://www.instagram.com/grabatoz/', Icon: FaInstagram, color: '#E4405F' },
                  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/grabatozae', Icon: FaLinkedinIn, color: '#0A66C2' },
                  { name: 'Pinterest', href: 'https://www.pinterest.com/grabatoz/', Icon: FaPinterestP, color: '#E60023' },
                  { name: 'TikTok', href: 'https://www.tiktok.com/@grabatoz', Icon: FaTiktok, color: '#000000' },
                  { name: 'YouTube', href: 'https://www.youtube.com/@grabAtoZ', Icon: FaYoutube, color: '#FF0000' },
                ].map(({ name, href, Icon, color }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-white border border-gray-200 text-current hover:bg-gray-50 transition-colors"
                    style={{ color }}
                    aria-label={name}
                    title={name}
                  >
                    <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 mt-12 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="order-2 md:order-1 text-sm text-white text-center md:text-left">
              © {new Date().getFullYear()} Grabatoz Powered By Crown Excel
            </p>
            <nav aria-label="Footer links" className="order-1 md:order-2 text-sm">
              <ul className="flex items-center gap-5 text-white">
                <li>
                <Link to="https://www.grabatoz.ae/privacy-policy" target='_blank' className="hover:text-white transition-colors">Privacy</Link>
                </li>
                <li>
                  <Link to="https://www.grabatoz.ae/disclaimer-policy" target='_blank' className="hover:text-white transition-colors">Disclaimer</Link>
                </li>
                <li>
                  <Link to="https://www.grabatoz.ae/contact" target='_blank' className="hover:text-white transition-colors">Contact</Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
