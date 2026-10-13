    document.addEventListener('DOMContentLoaded', () => {
      const root = document.documentElement;
      root.classList.add('js');
      const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
      let userPaused = false;
      try { userPaused = localStorage.getItem('growth-motion-paused') === 'true'; } catch {}
      const motionToggle = document.getElementById('motion-toggle');
      const servicesToggle = document.getElementById('services-toggle');
      const isStatic = () => root.classList.contains('motion-paused');
      const isServicesList = () => isStatic() || root.classList.contains('services-list') || root.classList.contains('services-reflow');
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
        if (root.classList.contains('motion-paused')) return;
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
        if (root.classList.contains('motion-paused')) { points = []; requestAnimationFrame(drawCursor); return; }
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
          if (entry.isIntersecting && !root.classList.contains('motion-paused')) { entry.target.play().catch(e => {}); }
          else { entry.target.pause(); }
        });
      }, { threshold: 0 }); 
      videos.forEach(video => { videoObserver.observe(video); });

      // 2. TEXT REVEAL
      const revealTextContainer = document.getElementById('reveal-text');
      const lines = revealTextContainer.querySelectorAll('.reveal-line');
      const wordSpans = []; 
      lines.forEach(line => {
        const text = line.textContent; line.textContent = '';
        const words = text.split(' ');
        words.forEach(word => {
          if(!word.trim()) return;
          const span = document.createElement('span'); span.className = 'reveal-word';
          span.textContent = word;
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
      
      if (mobileMenuToggle && mainNav) {
        const mobile = window.matchMedia('(max-width: 900px)');
        const setMenu = (open, restore = false) => {
          mobileMenuToggle.classList.toggle('is-active', open);
          mainNav.classList.toggle('is-open', open);
          mobileMenuToggle.setAttribute('aria-expanded', String(open));
          mobileMenuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
          mainNav.inert = mobile.matches && !open;
          if (restore) mobileMenuToggle.focus();
        };
        mobileMenuToggle.addEventListener('click', () => setMenu(!mainNav.classList.contains('is-open')));
        mainNav.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => {
          const target = document.querySelector(link.hash);
          setMenu(false);
          if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
        }));
        document.addEventListener('keydown', event => {
          if (event.key === 'Escape' && mainNav.classList.contains('is-open')) setMenu(false, true);
        });
        mainNav.addEventListener('focusout', () => setTimeout(() => {
          if (!mainNav.contains(document.activeElement) && document.activeElement !== mobileMenuToggle) setMenu(false);
        }, 0));
        mobile.addEventListener('change', () => setMenu(false));
        setMenu(false);
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
        if (hScrollShell && hScrollTrack && window.innerWidth <= 900 && !isServicesList()) {
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
        siteFooter.classList.toggle('is-static', siteFooter.offsetHeight > window.innerHeight || isStatic());
      };

      const handleScroll = () => {
        if (window.scrollY > 50) { header.classList.add('scrolled'); } else { header.classList.remove('scrolled'); }

        if (isStatic()) {
          heroMaskWrapper.style.maskImage = 'none';
          heroMaskWrapper.style.webkitMaskImage = 'none';
          hScrollTrack.style.transform = '';
          illumProgressBar.style.height = '100%';
          illumSteps.forEach(step => step.classList.add('is-illuminated'));
          return;
        }

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
        if (hScrollShell && hScrollTrack && !isServicesList()) {
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

      const updateMotion = () => {
        const paused = userPaused || motionPreference.matches;
        root.classList.toggle('motion-paused', paused);
        motionToggle.hidden = false;
        motionToggle.setAttribute('aria-pressed', String(paused));
        motionToggle.textContent = paused ? 'Motion paused' : 'Pause motion';
        motionToggle.disabled = motionPreference.matches;
        videos.forEach(video => {
          if (paused) video.pause();
          else if (video.getBoundingClientRect().bottom > 0 && video.getBoundingClientRect().top < innerHeight) video.play().catch(() => {});
        });
        syncHorizontalScrollStage(); syncFooterReveal(); handleScroll();
        if (!paused) { syncReadingFit(); syncServicesFit(); }
      };
      motionToggle.addEventListener('click', () => {
        userPaused = !userPaused;
        try { localStorage.setItem('growth-motion-paused', String(userPaused)); } catch {}
        updateMotion();
      });
      motionPreference.addEventListener('change', updateMotion);
      servicesToggle.hidden = false;
      servicesToggle.addEventListener('click', () => {
        const list = root.classList.toggle('services-list');
        servicesToggle.setAttribute('aria-pressed', String(list));
        servicesToggle.textContent = list ? 'Use scrolling services view' : 'Read services as a list';
        hScrollTrack.style.transform = ''; syncServicesFit(); syncHorizontalScrollStage(); handleScroll();
      });
      const syncReadingFit = () => {
        if (isStatic()) return;
        root.classList.remove('hero-reflow', 'reveal-reflow');
        root.classList.toggle('hero-reflow', document.querySelector('.hero-content').scrollHeight + header.offsetHeight + 80 > document.querySelector('.hero').clientHeight);
        const revealSticky = document.querySelector('.reveal-sticky');
        root.classList.toggle('reveal-reflow', revealTextContainer.scrollHeight + 48 > revealSticky.clientHeight);
      };
      const syncServicesFit = () => {
        if (isStatic() || root.classList.contains('services-list')) return;
        root.classList.remove('services-reflow');
        const style = getComputedStyle(hScrollSticky);
        const cards = [...hScrollTrack.children];
        const requiredHeight = hScrollTrack.offsetTop + Math.max(...cards.map(card => card.offsetHeight)) + parseFloat(style.paddingBottom);
        root.classList.toggle('services-reflow', requiredHeight > hScrollSticky.clientHeight);
        syncHorizontalScrollStage();
        handleScroll();
      };
      // Arrow keys provide the same progression as vertical scrolling.
      hScrollTrack.addEventListener('keydown', event => {
        if (event.target !== hScrollTrack || isServicesList()) return;
        const directions = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        if (!(event.key in directions) && event.key !== 'Home' && event.key !== 'End') return;
        event.preventDefault();
        const start = window.scrollY + hScrollShell.getBoundingClientRect().top;
        const distance = Math.max(1, hScrollShell.offsetHeight - window.innerHeight);
        const current = Math.max(0, Math.min(distance, window.scrollY - start));
        const step = distance / Math.max(1, hScrollTrack.children.length - 1);
        const progress = event.key === 'Home' ? 0 : event.key === 'End' ? distance : Math.max(0, Math.min(distance, current + directions[event.key] * step));
        window.scrollTo({ top: start + progress, behavior: 'instant' });
      });
      // Focusing the gallery starts with its first card visible, without a clipped outline.
      hScrollTrack.addEventListener('focus', () => {
        if (!isServicesList() && hScrollShell.getBoundingClientRect().top > 0) {
          window.scrollTo({ top: window.scrollY + hScrollShell.getBoundingClientRect().top, behavior: 'instant' });
        }
      });
      const servicesResize = new ResizeObserver(syncServicesFit);
      [...hScrollTrack.children, hScrollShell.querySelector('h2'), servicesToggle].forEach(element => servicesResize.observe(element));
      const readingResize = new ResizeObserver(() => { syncReadingFit(); handleScroll(); });
      [revealTextContainer, document.querySelector('.hero-content')].forEach(element => readingResize.observe(element));
      updateMotion();
      syncServicesFit();
      syncHorizontalScrollStage();
      syncFooterReveal();
      window.addEventListener('resize', () => {
        syncReadingFit();
        syncServicesFit();
        syncHorizontalScrollStage();
        syncFooterReveal();
        handleScroll();
      });
      window.addEventListener('scroll', handleScroll);
      handleScroll();
    });
