/**
 * Aona India - Theme JavaScript
 * Myntra-style Mobile-First Luxury E-commerce
 */

(function() {
  'use strict';

  // ============================================
  // Global State
  // ============================================
function getSafeStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    localStorage.removeItem(key);
    return [];
  }
}

const AonaTheme = {
  wishlist: getSafeStorage('aona_wishlist'),
  cart: getSafeStorage('aona_cart'),
    filters: {
      category: 'all',
      material: [],
      priceMin: 0,
      priceMax: 50000,
      inStock: true,
      express: false,
      handcrafted: false,
      newArrivals: false,
      onSale: false
    },
    currentPage: 1,
    isLoading: false
  };

  // ============================================
  // Initialize on DOM Ready
  // ============================================
  document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initBottomNav();
    initSearch();
    initWishlist();
    initQuickAdd(); 
    initProductGrid();
    initFilters();
    initInfiniteScroll();
    initMobileCardShadow();
    initContactPopup();
    updateCartCount();
    initLoginDrawer(); 
  });

  // ============================================
  // Mobile Menu
  // ============================================
  function initMobileMenu() {
    const menuBtn = document.getElementById('menuToggle');
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('menuOverlay');
    const closeBtn = document.getElementById('menuClose');

    if (!menuBtn || !menu) return;

    function openMenu() {
      menu.classList.add('active');
      overlay?.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      menu.classList.remove('active');
      overlay?.classList.remove('active');
      document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', openMenu);
    closeBtn?.addEventListener('click', closeMenu);
    overlay?.addEventListener('click', closeMenu);
  }

  // ============================================
  // Bottom Navigation
  // ============================================
  function initBottomNav() {
    const navItems = document.querySelectorAll('.bottom-nav__item');
    
    navItems.forEach(item => {
      item.addEventListener('click', function(e) {
        const page = this.dataset.page;
        
        if (page === 'contact') {
          e.preventDefault();
          window.openContactPopup();
          return;
        }
        
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        const rootUrl = window.routes ? window.routes.root_url : '/';
        
        if (page && page !== 'home') {
          window.location.href = rootUrl + page;
        } else if (page === 'home') {
          window.location.href = rootUrl;
        }
      });
    });
  }

  // ============================================
  // Contact Popup
  // ============================================
  function initContactPopup() {
    const popup = document.getElementById('contact-popup');
    const overlay = document.querySelector('.contact-popup-overlay');
    const closeBtn = document.querySelector('.contact-popup-close');

    if (!popup) return;

    overlay?.addEventListener('click', closeContactPopup);
    closeBtn?.addEventListener('click', closeContactPopup);
  }

  function openContactPopup() {
    const popup = document.getElementById('contact-popup');
    if (!popup) return;
    popup.classList.add('active');
    popup.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeContactPopup() {
    const popup = document.getElementById('contact-popup');
    if (!popup) return;
    popup.classList.remove('active');
    popup.style.display = 'none';
    document.body.style.overflow = '';
  }

  window.openContactPopup = openContactPopup;
  window.closeContactPopup = closeContactPopup;

  // ============================================
  // Search
  // ============================================
  window.clearSearch = function() {
    const input = document.getElementById('searchInput') || document.getElementById('header-search-input');
    if (input) {
      input.value = '';
      input.focus();
      if (window.location.pathname.includes('/search')) {
        const rootUrl = window.routes ? window.routes.root_url : '/';
        window.location.href = rootUrl + 'search';
      }
    }
  };

  function initSearch() {
    const searchInput = document.getElementById('header-search-input');
    const searchSuggestions = document.getElementById('header-search-suggestions');

    if (!searchInput || !searchSuggestions) return;

    let searchTimeout;

    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      const query = this.value.trim();

      if (query.length > 2) {
        searchTimeout = setTimeout(() => {
          performSearch(query);
        }, 300);
      } else {
        searchSuggestions.classList.remove('active');
      }
    });

    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const query = this.value.trim();
        if (query) {
          const rootUrl = window.routes ? window.routes.root_url : '/';
          window.location.href = rootUrl + 'search?q=' + encodeURIComponent(query) + '&type=product';
        }
      }
    });
    
    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
        searchSuggestions.classList.remove('active');
      }
    });
  }

  function performSearch(query) {
    const searchUrl = window.routes ? window.routes.predictive_search_url : '/search/suggest.json';
    fetch(`${searchUrl}?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=6`)
      .then(response => response.json())
      .then(data => {
        const products = data.resources.results.products;
        displaySearchResults(products);
      })
      .catch(error => console.error('Search error:', error));
  }

  function displaySearchResults(products) {
    const searchSuggestions = document.getElementById('header-search-suggestions');
    let listContainer = searchSuggestions.querySelector('.suggestions-list');
    
    if (!listContainer) {
       listContainer = document.createElement('div');
       listContainer.className = 'suggestions-list';
       searchSuggestions.appendChild(listContainer);
    }

    if (products.length === 0) {
      listContainer.innerHTML = '<div class="suggestion-item" style="padding:12px;">No products found</div>';
    } else {
      listContainer.innerHTML = products.map(product => `
        <a href="${product.url}" class="suggestion-item" style="display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid #f0f0f0;">
          <div style="width: 50px; height: 50px; flex-shrink: 0; border-radius: 4px; overflow: hidden; background: #f5f5f5;">
             <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div class="suggestion-info">
            <span class="suggestion-title" style="display: block; font-size: 14px; font-weight: 500; color: #1A1A1A; line-height: 1.2; margin-bottom: 4px;">${product.title}</span>
            <span class="suggestion-price" style="font-size: 13px; font-weight: 600; color: #880015;">₹${product.price}</span>
          </div>
        </a>
      `).join('');
    }

    searchSuggestions.classList.add('active');
  }

  // ============================================
  // Wishlist
  // ============================================
  function initWishlist() {
    updateWishlistButtons();
    document.addEventListener('click', function(e) {
      const wishlistBtn = e.target.closest('.crimson-card__wishlist');
      if (wishlistBtn) {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(wishlistBtn);
      }
    });
  }

  function toggleWishlist(button) {
    const productId = button.dataset.productId;
    const productHandle = button.dataset.productHandle;
    const index = AonaTheme.wishlist.findIndex(item => item.id === productId);
    
    if (index > -1) {
      AonaTheme.wishlist.splice(index, 1);
      button.classList.remove('active');
      window.showToast('Removed from wishlist');
    } else {
      AonaTheme.wishlist.push({ id: productId, handle: productHandle });
      button.classList.add('active');
      window.showToast('Added to wishlist');
    }
    
    localStorage.setItem('aona_wishlist', JSON.stringify(AonaTheme.wishlist));
    updateWishlistCount();
  }

  function updateWishlistButtons() {
    const wishlistBtns = document.querySelectorAll('.crimson-card__wishlist');
    wishlistBtns.forEach(btn => {
      const productId = btn.dataset.productId;
      const isWishlisted = AonaTheme.wishlist.some(item => item.id === productId);
      if (isWishlisted) {
        btn.classList.add('active');
      }
    });
  }

  function updateWishlistCount() {
    const badge = document.getElementById('wishlist-count');
    if (badge) {
      badge.textContent = AonaTheme.wishlist.length;
      badge.style.display = AonaTheme.wishlist.length > 0 ? 'flex' : 'none';
    }
  }

  // ============================================
  // Quick Add to Cart (Delegation Fallback)
  // ============================================
  function initQuickAdd() {
    document.addEventListener('click', function(e) {
      // Ignore if it's already using the global onclick defined below
      if(e.target.hasAttribute('onclick') && e.target.getAttribute('onclick').includes('quickAddToCart')) return;

      const quickAddBtn = e.target.closest('.crimson-card__quick-add');
      if (quickAddBtn && !quickAddBtn.disabled) {
        e.preventDefault();
        e.stopPropagation();
        window.quickAddToCart(quickAddBtn); // Route through unified function
      }
    });
  }

  function updateCartCount() {
    const cartUrl = window.routes ? window.routes.cart_url + '.js' : '/cart.js';
    fetch(cartUrl)
      .then(response => response.json())
      .then(cart => {
        const badge = document.getElementById('cartCount');
        if (badge) {
          badge.textContent = cart.item_count;
          badge.style.display = cart.item_count > 0 ? 'flex' : 'none';
        }
      })
      .catch(e => console.error("Error updating cart count", e));
  }

  // ============================================
  // Infinite Scroll
  // ============================================
  function initProductGrid() {}

  function initInfiniteScroll() {
    const trigger = document.getElementById('infiniteScrollTrigger');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (!trigger && !loadMoreBtn) return;

    if (trigger) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !AonaTheme.isLoading) {
            loadMoreProducts();
          }
        });
      }, { rootMargin: '200px' });

      observer.observe(trigger);
    }

    loadMoreBtn?.addEventListener('click', loadMoreProducts);
  }

  function loadMoreProducts() {
    const grid = document.getElementById('productGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (!grid || AonaTheme.isLoading) return;

    const currentPage = parseInt(grid.dataset.page) || 1;
    const totalPages = parseInt(grid.dataset.totalPages) || 1;
    
    if (currentPage >= totalPages) {
      loadMoreBtn?.parentElement?.remove();
      return;
    }

    AonaTheme.isLoading = true;
    loadMoreBtn?.classList.add('loading');

    const collection = loadMoreBtn?.dataset.collection || '';
    const nextPage = currentPage + 1;

    showLoadingSkeletons(grid, 4);

    fetch(`/collections/${collection}?page=${nextPage}&view=ajax`)
      .then(response => response.text())
      .then(html => {
        removeLoadingSkeletons(grid);
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newProducts = doc.querySelectorAll('.crimson-card');
        
        newProducts.forEach(product => {
          grid.appendChild(product);
          if (window.mobileCardObserver) {
            window.mobileCardObserver.observe(product);
          }
        });

        grid.dataset.page = nextPage;
        updateWishlistButtons();
        
        AonaTheme.isLoading = false;
        loadMoreBtn?.classList.remove('loading');

        if (nextPage >= totalPages) {
          loadMoreBtn?.parentElement?.remove();
        }
      })
      .catch(error => {
        console.error('Load more error:', error);
        removeLoadingSkeletons(grid);
        AonaTheme.isLoading = false;
        loadMoreBtn?.classList.remove('loading');
      });
  }

  function showLoadingSkeletons(grid, count) {
    const template = document.getElementById('productSkeletonTemplate');
    if (!template) return;
    for (let i = 0; i < count; i++) {
      const skeleton = template.content.cloneNode(true);
      grid.appendChild(skeleton);
    }
  }

  function removeLoadingSkeletons(grid) {
    const skeletons = grid.querySelectorAll('.product-skeleton');
    skeletons.forEach(skeleton => skeleton.remove());
  }

  // ============================================
  // Mobile Card Shadow on Scroll
  // ============================================
  function initMobileCardShadow() {
    if (window.innerWidth >= 768) return;

    const cards = document.querySelectorAll('.crimson-card');
    window.mobileCardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '-50px 0px'
    });

    cards.forEach(card => window.mobileCardObserver.observe(card));
  }

  // ============================================
  // Filters
  // ============================================
  function initFilters() {
    const filterBtn = document.getElementById('filterBtn');
    const filterPanel = document.getElementById('filterPanel');
    const filterOverlay = document.getElementById('filterOverlay');
    const filterClose = document.getElementById('filterClose');
    const clearFilters = document.getElementById('clearFilters');
    const applyFilters = document.getElementById('applyFilters');

    if (!filterBtn || !filterPanel) return;

    filterBtn.addEventListener('click', () => {
      filterPanel.classList.add('active');
      filterOverlay?.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    function closeFilterPanel() {
      filterPanel.classList.remove('active');
      filterOverlay?.classList.remove('active');
      document.body.style.overflow = '';
    }

    filterClose?.addEventListener('click', closeFilterPanel);
    filterOverlay?.addEventListener('click', closeFilterPanel);

    const filterToggles = document.querySelectorAll('.filter-toggle');
    filterToggles.forEach(toggle => {
      toggle.addEventListener('click', function() {
        this.classList.toggle('active');
      });
    });

    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', function() {
        filterChips.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
      });
    });

    clearFilters?.addEventListener('click', () => {
      filterToggles.forEach(toggle => toggle.classList.remove('active'));
      filterChips.forEach(chip => chip.classList.remove('active'));
      filterChips[0]?.classList.add('active');
      if(document.getElementById('priceMin')) document.getElementById('priceMin').value = '0';
      if(document.getElementById('priceMax')) document.getElementById('priceMax').value = '50000';
    });

    applyFilters?.addEventListener('click', () => {
      const activeFilters = collectActiveFilters();
      applyFiltersToGrid(activeFilters);
      closeFilterPanel();
    });
  }

  function collectActiveFilters() {
    const filters = {
      category: document.querySelector('.filter-chip.active')?.dataset.filter || 'all',
      materials: [],
      priceMin: parseInt(document.getElementById('priceMin')?.value) || 0,
      priceMax: parseInt(document.getElementById('priceMax')?.value) || 50000,
      options: []
    };

    document.querySelectorAll('.filter-toggle.active').forEach(toggle => {
      const filter = toggle.dataset.filter;
      if (['brass', 'resin', 'bronze', 'marble'].includes(filter)) {
        filters.materials.push(filter);
      } else {
        filters.options.push(filter);
      }
    });

    return filters;
  }

  function applyFiltersToGrid(filters) {
    const params = new URLSearchParams();
    
    if (filters.category !== 'all') {
      params.set('filter.p.tag', filters.category);
    }
    
    if (filters.materials.length > 0) {
      filters.materials.forEach(m => params.append('filter.p.tag', m));
    }
    
    params.set('filter.v.price.gte', filters.priceMin);
    params.set('filter.v.price.lte', filters.priceMax);

    window.location.search = params.toString();
  }

  // ============================================
  // Toast Notifications
  // ============================================
  window.showToast = function(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    existingToast?.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<span class="toast__message">${message}</span>`;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('active'), 10);
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // ============================================
  // Flash Sale Timer
  // ============================================
  function initFlashSaleTimer() {
    const timerElements = document.querySelectorAll('.flash-timer');
    
    timerElements.forEach(timer => {
      const endTime = timer.dataset.endTime;
      if (!endTime) return;

      const safeEndTime = endTime.replace(/\s/, 'T').replace(/\//g, '-');
      const endDate = new Date(safeEndTime).getTime();

      function updateTimer() {
        const now = new Date().getTime();
        const distance = endDate - now;

        if (distance < 0) {
          timer.innerHTML = '<span>Sale Ended</span>';
          return;
        }

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const hEl = timer.querySelector('.hours');
        const mEl = timer.querySelector('.minutes');
        const sEl = timer.querySelector('.seconds');
        
        if(hEl) hEl.textContent = hours.toString().padStart(2, '0');
        if(mEl) mEl.textContent = minutes.toString().padStart(2, '0');
        if(sEl) sEl.textContent = seconds.toString().padStart(2, '0');
      }

      updateTimer();
      setInterval(updateTimer, 1000);
    });
  }

  document.addEventListener('DOMContentLoaded', initFlashSaleTimer);

  // ============================================
  // Image Gallery (PDP)
  // ============================================
  function initProductGallery() {
    const gallery = document.querySelector('.product-gallery');
    if (!gallery) return;

    const slides = gallery.querySelectorAll('.product-gallery__slide');
    const dots = gallery.querySelectorAll('.product-gallery__dot');
    let currentSlide = 0;

    function goToSlide(index) {
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
      currentSlide = index;
    }

    let touchStartX = 0;
    let touchEndX = 0;

gallery.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

gallery.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, { passive: true });

    function handleSwipe() {
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentSlide < slides.length - 1) {
          goToSlide(currentSlide + 1);
        } else if (diff < 0 && currentSlide > 0) {
          goToSlide(currentSlide - 1);
        }
      }
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => goToSlide(index));
    });
  }

  document.addEventListener('DOMContentLoaded', initProductGallery);

  // ============================================
  // Pincode Checker
  // ============================================
  function initPincodeChecker() {
    const form = document.getElementById('pincodeForm');
    const input = document.getElementById('pincodeInput');
    const result = document.getElementById('pincodeResult');

    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const pincode = input.value.trim();

      if (pincode.length !== 6) {
        result.innerHTML = '<span class="error">Please enter a valid 6-digit pincode</span>';
        return;
      }

      result.innerHTML = '<span class="loading">Checking...</span>';

      setTimeout(() => {
        if (['110001', '110002', '110003', '400001', '400002', '560001'].includes(pincode)) {
          result.innerHTML = `
            <span class="success">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Delivery available! Get it by <strong>Tomorrow</strong>
            </span>
          `;
        } else {
          result.innerHTML = `
            <span class="warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Delivery in 3-5 business days
            </span>
          `;
        }
      }, 800);
    });
  }

  document.addEventListener('DOMContentLoaded', initPincodeChecker);

  // ============================================
  // Login Drawer Init
  // ============================================
  function initLoginDrawer() {
    const closeBtns = document.querySelectorAll('[data-close-drawer], .login-drawer__close, .login-drawer__overlay');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const drawer = document.getElementById('login-drawer');
        if (drawer) {
          drawer.setAttribute('aria-hidden', 'true');
          setTimeout(() => {
              drawer.style.visibility = 'hidden';
          }, 300);
          document.body.style.overflow = '';
        }
      });
    });
  }

  // Export for global access
  window.AonaTheme = AonaTheme;

})();

// ============================================
// Global Exports (For Inline HTML Handlers)
// ============================================

// Global Login Drawer Open
window.openLoginDrawer = function() {
  const drawer = document.getElementById('login-drawer');
  if (drawer) {
    drawer.setAttribute('aria-hidden', 'false');
    drawer.style.visibility = 'visible'; 
    document.body.style.overflow = 'hidden';
  } else {
    // Standard localized route fallback
    const loginUrl = window.routes ? window.routes.root_url + 'account/login' : '/account/login';
    window.location.href = loginUrl;
  }
};

// Unified Global Quick Add To Cart 
window.quickAddToCart = async function(btn) {
  const variantId = btn.getAttribute('data-variant-id') || btn.previousElementSibling?.value;
  if(!variantId) return;

  const originalText = btn.innerHTML;
  btn.innerHTML = "Adding...";
  btn.disabled = true;

  const addUrl = window.routes ? window.routes.cart_add_url + '.js' : '/cart/add.js';

  try {
    const response = await fetch(addUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] })
    });

    if (response.ok) {
      btn.innerHTML = "Added ✓";
      btn.style.background = "#2e7d32";
      btn.style.color = "white";
      if(window.showToast) window.showToast('Added to bag!');
      // Refresh page to update cart bubble/drawer reliably
      setTimeout(() => window.location.reload(), 800);
    } else {
      throw new Error('Stock error');
    }
  } catch (error) {
    btn.innerHTML = "Failed";
    btn.style.background = "#d32f2f";
    btn.style.color = "white";
    if(window.showToast) window.showToast('Error adding to bag', 'error');
    
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
      btn.style.background = "";
      btn.style.color = "";
    }, 2000);
  }
};