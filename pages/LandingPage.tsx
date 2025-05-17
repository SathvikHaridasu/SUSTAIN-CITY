
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sprout, Building2, Globe, Shield, Sun, TreeDeciduous, Wind, SproutIcon } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";

const LandingPage = () => {
  const animatedElementsRef = useRef<HTMLDivElement[]>([]);
  
  useEffect(() => {
    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all animated elements
    animatedElementsRef.current.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el: HTMLDivElement) => {
    if (el && !animatedElementsRef.current.includes(el)) {
      animatedElementsRef.current.push(el);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with glass morphism header */}
      <header className="sticky top-0 z-10 py-6 px-6 flex items-center justify-between border-b backdrop-blur-sm bg-white/70">
        <div className="flex items-center gap-2">
          <SproutIcon className="h-6 w-6 text-teal-600" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 text-transparent bg-clip-text">SustainCityPlanner</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="outline" className="transition-all duration-300 hover:shadow-md border-teal-600/20 hover:bg-teal-50">Login</Button>
          </Link>
          <Link to="/login?register=true">
            <Button className="transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] bg-teal-600 hover:bg-teal-700">Sign Up</Button>
          </Link>
        </div>
      </header>

      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="container py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6" ref={addToRefs}>
            <span className="inline-block px-3 py-1 text-xs font-medium bg-teal-50 text-teal-600 rounded-full">Sustainable Urban Planning</span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Design <span className="bg-gradient-to-r from-teal-600 to-emerald-600 text-transparent bg-clip-text">Sustainable Cities</span> for a Better Tomorrow
            </h1>
            <p className="text-lg text-stone-600">
              Create, plan, and visualize sustainable urban environments with our interactive city planning tool.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/login">
                <Button size="lg" className="gap-2 transition-all duration-300 hover:scale-[1.03] shadow-md hover:shadow-lg bg-teal-600 hover:bg-teal-700">
                  Get Started <ArrowRight className="h-4 w-4 animate-pulse-subtle" />
                </Button>
              </Link>
              <Link to="/login?register=true">
                <Button size="lg" variant="outline" className="transition-all duration-300 hover:bg-teal-50 border-teal-600/20">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 transform transition-all duration-500" ref={addToRefs}>
            <div className="aspect-square md:aspect-auto md:h-[400px] bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl grid grid-cols-3 grid-rows-3 gap-2 p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
              {/* City visualization preview with sustainability theme */}
              {Array.from({ length: 9 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`rounded ${
                    i === 4 ? 'bg-teal-500/40' : 
                    i % 2 === 0 ? 'bg-emerald-400/30' : 'bg-blue-300/40'
                  } hover:bg-teal-400/20 transition-colors transform hover:scale-105 transition-transform duration-300 shadow-sm`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Features Section with improved cards */}
        <section className="bg-gradient-to-b from-stone-50 to-white py-20" ref={addToRefs}>
          <div className="container">
            <div className="text-center mb-12">
              <span className="inline-block px-3 py-1 text-xs font-medium bg-teal-50 text-teal-600 rounded-full">Features</span>
              <h2 className="text-3xl font-bold mt-4">Plan Sustainable Urban Environments</h2>
              <div className="w-24 h-1 bg-teal-600 mx-auto mt-6 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px]">
                <div className="bg-teal-50 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Urban Planning</h3>
                <p className="text-stone-600">
                  Design city layouts with different building types and infrastructure options for maximum sustainability.
                </p>
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-teal-600"></div>
                      </div>
                      <span>Dynamic building placement</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-teal-600"></div>
                      </div>
                      <span>Various zoning options</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px]">
                <div className="bg-emerald-50 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <TreeDeciduous className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Environmental Impact</h3>
                <p className="text-stone-600">
                  See real-time environmental metrics as you build your sustainable city.
                </p>
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                      </div>
                      <span>Carbon footprint tracking</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                      </div>
                      <span>Sustainability scoring</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px]">
                <div className="bg-blue-50 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Share & Collaborate</h3>
                <p className="text-stone-600">
                  Save multiple city designs and access them from anywhere.
                </p>
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      </div>
                      <span>Cloud storage</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      </div>
                      <span>Export designs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sustainability Benefits Section */}
        <section className="container py-16" ref={addToRefs}>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-teal-50 text-teal-600 rounded-full">Sustainability Benefits</span>
            <h2 className="text-3xl font-bold mt-4">Creating Sustainable Communities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-stone-50 rounded-xl border border-stone-200 p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reduced Carbon Footprint</h3>
              <p className="text-stone-600">Smart city planning can reduce emissions by up to 70% through optimized transportation and energy usage.</p>
            </div>
            
            <div className="bg-stone-50 rounded-xl border border-stone-200 p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Healthier Communities</h3>
              <p className="text-stone-600">Green spaces and reduced pollution lead to a 30% improvement in community health outcomes.</p>
            </div>
            
            <div className="bg-stone-50 rounded-xl border border-stone-200 p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Wind className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Renewable Integration</h3>
              <p className="text-stone-600">Plan cities that integrate renewable energy sources, reducing dependency on fossil fuels.</p>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-teal-50" ref={addToRefs}>
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <div className="text-4xl font-bold text-teal-600 mb-2">1000+</div>
                <div className="text-sm text-stone-600">Active Users</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl font-bold text-teal-600 mb-2">5000+</div>
                <div className="text-sm text-stone-600">Cities Designed</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl font-bold text-teal-600 mb-2">98%</div>
                <div className="text-sm text-stone-600">Satisfaction Rate</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl font-bold text-teal-600 mb-2">24/7</div>
                <div className="text-sm text-stone-600">Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Steps Section */}
        <section className="container py-20" ref={addToRefs}>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-teal-50 text-teal-600 rounded-full">How It Works</span>
            <h2 className="text-3xl font-bold mt-4">Building Your Sustainable City in 3 Simple Steps</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-xl font-bold text-teal-600 mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-stone-600">Create your free account to get started with SustainCityPlanner.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-xl font-bold text-teal-600 mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Design</h3>
              <p className="text-stone-600">Drag and drop buildings and infrastructure to create your sustainable city.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-xl font-bold text-teal-600 mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Analyze & Share</h3>
              <p className="text-stone-600">Review sustainability metrics and share your designs with others.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-20" ref={addToRefs}>
          <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-50 border border-teal-100 rounded-xl p-10 text-center shadow-lg">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Ready to Design Your First Sustainable City?</h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-8">
                Join thousands of urban planners, architects, and sustainability enthusiasts creating the cities of tomorrow.
              </p>
              <Link to="/login?register=true">
                <Button size="lg" className="gap-2 transition-all duration-300 hover:scale-[1.03] shadow-md hover:shadow-lg bg-teal-600 hover:bg-teal-700">
                  <Sprout className="h-5 w-5" /> Create Your Free Account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-10 bg-white">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <SproutIcon className="h-6 w-6 text-teal-600" />
              <span className="font-bold text-lg">SustainCityPlanner</span>
            </div>
            <div className="text-sm text-stone-500">
              © {new Date().getFullYear()} SustainCityPlanner. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
