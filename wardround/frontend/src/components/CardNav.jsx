import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import './CardNav.css';

export const navItemShape = {
  label: '',
  bgColor: '',
  textColor: '',
  links: [{ label: '', href: '', ariaLabel: '' }],
};

export function CardNav({
  logoText = 'Logo',
  logoHref = '/',
  items = [],
  className = '',
  baseColor = 'rgba(255, 255, 255, 0.1)',
  menuColor = '#fff',
  buttonBgColor = '#a5f3fc',
  buttonTextColor = '#0f172a',
  buttonText = 'Get Started',
  buttonHref,
  showButton = true,
  actions,
  hideOnScroll = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 100);
      if (hideOnScroll) setIsHidden(y > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll]);

  const toggleMenu = () => setIsExpanded((prev) => !prev);

  const containerStyle = {
    transform: hideOnScroll && isHidden ? 'translateX(-50%) translateY(-100%)' : 'translateX(-50%) translateY(0)',
    opacity: hideOnScroll && isHidden ? 0 : 1,
    visibility: hideOnScroll && isHidden ? 'hidden' : 'visible',
    pointerEvents: hideOnScroll && isHidden ? 'none' : 'auto',
  };

  const navStyle = {
    backgroundColor: isScrolled ? 'rgba(15, 23, 42, 0.95)' : baseColor,
    backdropFilter: isScrolled ? 'blur(12px)' : undefined,
  };

  return (
    <div className={`card-nav-container ${className}`} style={containerStyle}>
      <nav
        className={`card-nav ${isExpanded ? 'open' : ''} ${isScrolled ? 'scrolled' : ''}`}
        style={navStyle}
      >
        <div className="card-nav-top">
          <button
            type="button"
            className={`hamburger-menu ${isExpanded ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            style={{ color: menuColor }}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>

          <Link to={logoHref} className="logo-container" aria-label="Home">
            <span className="logo-text" style={{ color: menuColor }}>
              {logoText}
            </span>
          </Link>

          {showButton && (
            <div className="card-nav-actions">
              {actions != null ? (
                actions
              ) : buttonHref ? (
                <Link
                  to={buttonHref}
                  className="card-nav-cta-button"
                  style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
                >
                  {buttonText}
                </Link>
              ) : (
                <button
                  type="button"
                  className="card-nav-cta-button"
                  style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
                >
                  {buttonText}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {items.slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              style={{
                backgroundColor: item.bgColor,
                color: item.textColor,
              }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links?.map((lnk, i) => {
                  const isExternal = lnk.href.startsWith('http');
                  if (isExternal) {
                    return (
                      <a
                        key={`${lnk.label}-${i}`}
                        href={lnk.href}
                        className="nav-card-link"
                        aria-label={lnk.ariaLabel}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ArrowUpRight className="nav-card-link-icon" aria-hidden />
                        {lnk.label}
                      </a>
                    );
                  }
                  return (
                    <Link
                      key={`${lnk.label}-${i}`}
                      to={lnk.href}
                      className="nav-card-link"
                      aria-label={lnk.ariaLabel}
                      onClick={() => setIsExpanded(false)}
                    >
                      <ArrowUpRight className="nav-card-link-icon" aria-hidden />
                      {lnk.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default CardNav;
