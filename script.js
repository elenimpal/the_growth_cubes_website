    document.addEventListener('DOMContentLoaded', () => {
      let globalCreamTop = window.innerHeight + 100;
      let globalCreamBottom = -100;

      // 0. MAGIC CURSOR
      const canvas = document.getElementById('magic-cursor');
      const ctx = canvas.getContext('2d');
      let points = [];
      const resizeCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      window.addEventListener('mousemove', (e) => {
        if (e.target.closest('.h-card') || e.target.closest('.glass-form-card') || e.target.closest('button') || e.target.closest('a')) return;
        
        const isHoveringCream = !!(e.target.closest('.h-scroll-shell') || e.target.closest('.contact-glass-section'));
        
        for (let i = 0; i < 3; i++) {
          points.push({ 
            x: e.clientX + (Math.random() - 0.5) * 20, y: e.clientY + (Math.random() - 0.5) * 20, 
            vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 1,
            age: 0, isCream: isHoveringCream, rotSpeed: (Math.random() - 0.5) * 15
          });
        }
      });

      const drawCursor = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        points.forEach(p => p.age += 0.015); points = points.filter(p => p.age < 1); 
        points.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          const size = (1 - p.age) * 6; const alpha = 1 - p.age;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.age * p.rotSpeed); 
          ctx.fillStyle = p.isCream ? `rgba(53, 17, 27, ${alpha})` : `rgba(244, 240, 234, ${alpha * 0.8})`; 
          ctx.fillRect(-size / 2, -size / 2, size, size); ctx.restore();
        });
        requestAnimationFrame(drawCursor);
      };
      drawCursor();

      // 1. VIDEO OPTIMIZATION
      const videos = document.querySelectorAll('.js-optimized-video');
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.play().catch(e => {}); } 
          else { entry.target.pause(); }
        });
      }, { threshold: 0 }); 
      videos.forEach(video => { videoObserver.observe(video); });

      // 2. TEXT REVEAL
      const revealTextContainer = document.getElementById('reveal-text');
      const lines = revealTextContainer.querySelectorAll('.reveal-line');
      const wordSpans = []; 
      lines.forEach(line => {
        const text = line.innerText; line.innerHTML = ''; 
        const words = text.split(' ');
        words.forEach(word => {
          if(!word.trim()) return;
          const span = document.createElement('span'); span.className = 'reveal-word';
          span.setAttribute('data-word', word); span.innerText = word; 
          line.appendChild(span); line.appendChild(document.createTextNode(' ')); 
          wordSpans.push(span);
        });
      });
      const revealSection = document.getElementById('reveal-section');

      /* Language switching remains disabled with the English-only page.
      const langToggle = document.getElementById('lang-toggle');
      const langOptions = langToggle.querySelectorAll('.lang-option');
      langOptions.forEach(option => {
        option.addEventListener('click', (e) => {
          langOptions.forEach(opt => opt.classList.remove('active')); e.target.classList.add('active');
          if (e.target.dataset.lang === 'el') { langToggle.classList.add('is-el'); } else { langToggle.classList.remove('is-el'); }
        });
      });
      */

      // 4. SPOTLIGHT HOVER LOGIC FOR THE CARDS
      const hScrollTrackElem = document.getElementById('h-scroll-track');
      if (hScrollTrackElem) {
        hScrollTrackElem.addEventListener('mousemove', (e) => {
          const cards = document.querySelectorAll('.h-card');
          cards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
          });
        });
      }

      // 5. MOBILE MENU LOGIC
      const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
      const mainNav = document.getElementById('main-nav');
      
      if(mobileMenuToggle && mainNav) {
        const navLinks = mainNav.querySelectorAll('.nav-link');
        
        mobileMenuToggle.addEventListener('click', () => {
          mobileMenuToggle.classList.toggle('is-active');
          mainNav.classList.toggle('is-open');
          mobileMenuToggle.setAttribute('aria-expanded', mainNav.classList.contains('is-open'));
        });
        
        navLinks.forEach(link => {
          link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('is-active');
            mainNav.classList.remove('is-open');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
          });
        });
      }

      // 6. GLOBAL SCROLL LOGIC
      const header = document.getElementById('main-header');
      const heroShell = document.getElementById('hero-shell');
      const heroMaskWrapper = document.getElementById('hero-mask-wrapper');
      
      const hScrollShell = document.getElementById('h-scroll-shell');
      const hScrollTrack = document.getElementById('h-scroll-track');
      const hScrollSticky = hScrollShell.querySelector('.h-scroll-sticky');

      const getHorizontalTravel = () => {
        if (window.innerWidth <= 900) {
          const lastCard = hScrollTrack.lastElementChild;
          const visibleWidth = hScrollSticky.clientWidth;
          return Math.max(0, hScrollTrack.scrollWidth - (visibleWidth + lastCard.offsetWidth) / 2);
        }
        return Math.max(0, hScrollTrack.scrollWidth - window.innerWidth);
      };

      const syncHorizontalScrollStage = () => {
        if (hScrollShell && hScrollTrack && window.innerWidth <= 900) {
          const horizontalDistance = getHorizontalTravel();
          hScrollShell.style.height = `${window.innerHeight + horizontalDistance}px`;
        } else if (hScrollShell) {
          hScrollShell.style.height = '';
        }
      };
      
      const illumTimeline = document.getElementById('hww-timeline');
      const illumProgressBar = document.getElementById('hww-progress-bar');
      const illumSteps = document.querySelectorAll('.hww-step-wrapper');

      // FOOTER: pinned under the contact card; fall back to normal flow if it can't fit on screen
      const siteFooter = document.getElementById('site-footer');
      const syncFooterReveal = () => {
        siteFooter.classList.toggle('is-static', siteFooter.offsetHeight > window.innerHeight);
      };

      const handleScroll = () => {
        if (window.scrollY > 50) { header.classList.add('scrolled'); } else { header.classList.remove('scrolled'); }

        // HERO MASK
        const heroRect = heroShell.getBoundingClientRect();
        const heroMaxScroll = Math.max(1, heroShell.offsetHeight - window.innerHeight);
        let heroProgress = 0;
        if (heroRect.top < 0) { heroProgress = Math.abs(heroRect.top) / heroMaxScroll; }
        heroProgress = Math.max(0, Math.min(1, heroProgress));
        const hTransStop = -50 + (heroProgress * 200); const hBlackStop = hTransStop + 50; 
        const heroMaskStyle = `linear-gradient(to top, transparent ${hTransStop}%, black ${hBlackStop}%)`;
        heroMaskWrapper.style.webkitMaskImage = heroMaskStyle; heroMaskWrapper.style.maskImage = heroMaskStyle;

        // TEXT REVEAL
        const revealRect = revealSection.getBoundingClientRect();
        const revealMaxScroll = Math.max(1, revealSection.offsetHeight - window.innerHeight);
        let revealProgress = 0; let startOffset = window.innerHeight * 0.4; 
        if (revealRect.top < startOffset) { revealProgress = (startOffset - revealRect.top) / (revealMaxScroll + startOffset); }
        let adjustedProgress = revealProgress * 1.5; adjustedProgress = Math.max(0, Math.min(1, adjustedProgress));
        const totalWords = wordSpans.length;
        wordSpans.forEach((span, index) => {
          const start = index / totalWords; const end = (index + 1) / totalWords; let p = 0; 
          if (adjustedProgress >= end) { p = 100; } else if (adjustedProgress <= start) { p = 0; } else { p = ((adjustedProgress - start) / (end - start)) * 100; }
          span.style.setProperty('--p', `${p}%`);
        });

        // HORIZONTAL SCROLL LOGIC
        if (hScrollShell && hScrollTrack) {
          const hRect = hScrollShell.getBoundingClientRect();
          
          const hMaxScroll = Math.max(1, hScrollShell.offsetHeight - window.innerHeight);
          let hProg = 0;
          if (hRect.top < 0) { hProg = Math.abs(hRect.top) / hMaxScroll; }
          hProg = Math.max(0, Math.min(1, hProg));

          const maxTranslate = getHorizontalTravel();
          hScrollTrack.style.transform = `translateX(-${hProg * maxTranslate}px)`;
        }

        // THE ILLUMINATED PATH LOGIC
        if (illumTimeline && illumProgressBar) {
          const tRect = illumTimeline.getBoundingClientRect();
          const viewportCenter = window.innerHeight / 2; 
          
          let tProg = (viewportCenter - tRect.top) / tRect.height;
          tProg = Math.max(0, Math.min(1, tProg)); 
          
          illumProgressBar.style.height = `${tProg * 100}%`;

          illumSteps.forEach(step => {
             const stepRect = step.getBoundingClientRect();
             if (stepRect.top < viewportCenter) {
                step.classList.add('is-illuminated');
             } else {
                step.classList.remove('is-illuminated');
             }
          });
        }
      };

      syncHorizontalScrollStage();
      syncFooterReveal();
      window.addEventListener('resize', () => {
        syncHorizontalScrollStage();
        syncFooterReveal();
        handleScroll();
      });
      window.addEventListener('scroll', handleScroll);
      handleScroll();
    });
