import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaPaintBrush, 
  FaUsers, 
  FaCloud, 
  FaLock, 
  FaArrowRight,
  FaPlay,
  FaCheck
} from 'react-icons/fa';
import styles from './index.module.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('whiteboard_user_token');

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/whiteboard');
    } else {
      navigate('/register');
    }
  };

  const features = [
    {
      icon: <FaPaintBrush />,
      title: "Rich Drawing Tools",
      description: "Complete set of drawing tools including brush, shapes, text, and more with customizable colors and sizes."
    },
    {
      icon: <FaUsers />,
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time. See changes instantly as others draw and edit."
    },
    {
      icon: <FaCloud />,
      title: "Cloud Storage",
      description: "Your whiteboards are automatically saved to the cloud. Access them from anywhere, anytime."
    },
    {
      icon: <FaLock />,
      title: "Secure Sharing",
      description: "Share your whiteboards securely with team members via email invitations and access controls."
    }
  ];

  const benefits = [
    "Unlimited canvas space for your ideas",
    "Real-time synchronization across devices",
    "Export your work as high-quality images",
    "Undo/Redo functionality for mistake-free editing",
    "Responsive design works on all devices",
    "No software installation required"
  ];

  return (
    <div className={styles.landingPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <FaPaintBrush className={styles.logoIcon} />
            <span>WhiteboardAZ</span>
          </div>
          <nav className={styles.nav}>
            <Link to="/login" className={styles.navLink}>Login</Link>
            <Link to="/register" className={styles.navButton}>Sign Up</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                Collaborate Visually in 
                <span className={styles.highlight}> Real-Time</span>
              </h1>
              <p className={styles.heroDescription}>
                Transform your ideas into reality with our powerful collaborative whiteboard. 
                Draw, design, and brainstorm together with your team from anywhere in the world.
              </p>
              <div className={styles.heroButtons}>
                <button onClick={handleGetStarted} className={styles.primaryButton}>
                  Get Started Free
                  <FaArrowRight className={styles.buttonIcon} />
                </button>
                <button className={styles.secondaryButton}>
                  <FaPlay className={styles.buttonIcon} />
                  Watch Demo
                </button>
              </div>
              <p className={styles.heroNote}>
                No credit card required • Free forever plan available
              </p>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.mockupContainer}>
                <div className={styles.mockup}>
                  <div className={styles.mockupHeader}>
                    <div className={styles.mockupDots}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <div className={styles.mockupContent}>
                    <div className={styles.toolbar}>
                      <div className={styles.toolItem}></div>
                      <div className={styles.toolItem}></div>
                      <div className={styles.toolItem}></div>
                      <div className={styles.toolItem}></div>
                    </div>
                    <div className={styles.canvas}>
                      <div className={styles.drawing}>
                        <div className={styles.shape1}></div>
                        <div className={styles.shape2}></div>
                        <div className={styles.shape3}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Everything you need to collaborate</h2>
            <p className={styles.sectionDescription}>
              Powerful features designed to enhance your creative workflow
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  {feature.icon}
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefits}>
        <div className={styles.container}>
          <div className={styles.benefitsContent}>
            <div className={styles.benefitsText}>
              <h2 className={styles.sectionTitle}>Why choose WhiteboardAZ?</h2>
              <p className={styles.sectionDescription}>
                Built for teams who value efficiency, creativity, and seamless collaboration.
              </p>
              <ul className={styles.benefitsList}>
                {benefits.map((benefit, index) => (
                  <li key={index} className={styles.benefitItem}>
                    <FaCheck className={styles.checkIcon} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <button onClick={handleGetStarted} className={styles.primaryButton}>
                Start Creating Now
                <FaArrowRight className={styles.buttonIcon} />
              </button>
            </div>
            <div className={styles.benefitsVisual}>
              <div className={styles.statsCard}>
                <div className={styles.stat}>
                  <div className={styles.statNumber}>10K+</div>
                  <div className={styles.statLabel}>Active Users</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statNumber}>50K+</div>
                  <div className={styles.statLabel}>Whiteboards Created</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statNumber}>99.9%</div>
                  <div className={styles.statLabel}>Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to start collaborating?</h2>
            <p className={styles.ctaDescription}>
              Join thousands of teams already using WhiteboardAZ to bring their ideas to life.
            </p>
            <div className={styles.ctaButtons}>
              <button onClick={handleGetStarted} className={styles.primaryButton}>
                Get Started Free
                <FaArrowRight className={styles.buttonIcon} />
              </button>
              <Link to="/login" className={styles.secondaryButton}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <div className={styles.logo}>
                <FaPaintBrush className={styles.logoIcon} />
                <span>WhiteboardAZ</span>
              </div>
              <p className={styles.footerDescription}>
                The collaborative whiteboard that brings teams together.
              </p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerColumn}>
                <h4>Product</h4>
                <Link to="/">Features</Link>
                <Link to="/">Pricing</Link>
                <Link to="/">Security</Link>
              </div>
              <div className={styles.footerColumn}>
                <h4>Company</h4>
                <Link to="/">About</Link>
                <Link to="/">Blog</Link>
                <Link to="/">Contact</Link>
              </div>
              <div className={styles.footerColumn}>
                <h4>Support</h4>
                <Link to="/">Help Center</Link>
                <Link to="/">Documentation</Link>
                <Link to="/">Status</Link>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>&copy; 2025 WhiteboardAZ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;