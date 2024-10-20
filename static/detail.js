document.addEventListener('DOMContentLoaded', function() {
  let currentSlide = 0;
  const slides = document.querySelectorAll('.slide');
  const slider = document.querySelector('.slider');
  const nextBtn = document.querySelector('.next-btn');
  const prevBtn = document.querySelector('.prev-btn');

  // Function to change the slide
  function changeSlide(index) {
    const slideWidth = slides[0].clientWidth;
    slider.style.transform = `translateX(-${index * slideWidth}px)`;
  }

  // Next Button
  nextBtn.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % slides.length;
    changeSlide(currentSlide);
  });

  // Previous Button
  prevBtn.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    changeSlide(currentSlide);
  });

  // Wikipedia API Fetch
  const cityName = document.querySelector('meta[name="description"]').getAttribute('content');
  const apiUrl = `https://zh.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=extracts&titles=${cityName}&exintro=true&origin=*&variant=zh-tw`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const page = Object.values(data.query.pages)[0];
      if (page.extract) {
        document.getElementById('wiki-content-short').innerHTML = page.extract.substring(0, 100) + '...';
        document.getElementById('wiki-content-full').innerHTML = page.extract;
      }
    });

  // Toggle Wikipedia content
  document.getElementById('toggleButton').addEventListener('click', function() {
    const contentFull = document.getElementById('wiki-content-full');
    const contentShort = document.getElementById('wiki-content-short');
    if (contentFull.style.display === 'none') {
      contentFull.style.display = 'block';
      contentShort.style.display = 'none';
      this.textContent = '收起';
    } else {
      contentFull.style.display = 'none';
      contentShort.style.display = 'block';
      this.textContent = '展開';
    }
  });

  // Initialize Google Map
  window.initMap = function() {
    const city = document.querySelector('meta[name="description"]').getAttribute('content');
    const geocoder = new google.maps.Geocoder();
    const map = new google.maps.Map(document.getElementById('map'), {
      zoom: 14
    });

    geocoder.geocode({ address: city }, function(results, status) {
      if (status === 'OK') {
        map.setCenter(results[0].geometry.location);
        new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
        });
      }
    });
  };
});
// slide ================================================

    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = (i === index) ? 'block' : 'none';
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Initialize the first slide
    showSlide(currentSlide);

    // Set the slide interval (e.g., change slide every 3 seconds)
    setInterval(nextSlide, 3000);

//Sticky Slider Navigation=====================================================
class StickyNavigation {
  
  constructor() {
    this.currentId = null;
    this.currentTab = null;
    this.tabContainerHeight = 70;
    let self = this;
    $('.et-hero-tab').click(function() { 
      self.onTabClick(event, $(this)); 
    });
    $(window).scroll(() => { this.onScroll(); });
    $(window).resize(() => { this.onResize(); });
  }
  
  onTabClick(event, element) {
    event.preventDefault();
    let scrollTop = $(element.attr('href')).offset().top - this.tabContainerHeight + 1;
    $('html, body').animate({ scrollTop: scrollTop }, 600);
  }
  
  onScroll() {
    this.checkTabContainerPosition();
    this.findCurrentTabSelector();
  }
  
  onResize() {
    if(this.currentId) {
      this.setSliderCss();
    }
  }
  
  checkTabContainerPosition() {
    let offset = $('.et-hero-tabs').offset().top + $('.et-hero-tabs').height() - this.tabContainerHeight;
    if($(window).scrollTop() > offset) {
      $('.et-hero-tabs-container').addClass('et-hero-tabs-container--top');
    } 
    else {
      $('.et-hero-tabs-container').removeClass('et-hero-tabs-container--top');
    }
  }
  
  findCurrentTabSelector(element) {
    let newCurrentId;
    let newCurrentTab;
    let self = this;
    $('.et-hero-tab').each(function() {
      let id = $(this).attr('href');
      let offsetTop = $(id).offset().top - self.tabContainerHeight;
      let offsetBottom = $(id).offset().top + $(id).height() - self.tabContainerHeight;
      if($(window).scrollTop() > offsetTop && $(window).scrollTop() < offsetBottom) {
        newCurrentId = id;
        newCurrentTab = $(this);
      }
    });
    if(this.currentId != newCurrentId || this.currentId === null) {
      this.currentId = newCurrentId;
      this.currentTab = newCurrentTab;
      this.setSliderCss();
    }
  }
  
  setSliderCss() {
    let width = 0;
    let left = 0;
    if(this.currentTab) {
      width = this.currentTab.css('width');
      left = this.currentTab.offset().left;
    }
    $('.et-hero-tab-slider').css('width', width);
    $('.et-hero-tab-slider').css('left', left);
  }
  
}

new StickyNavigation();

// ==============================================================



function displayPlaceDetails(place, loadingElement) {
  const name = place.name;
  const address = place.formatted_address ? `<p><i class="fas fa-map-marker-alt icon"></i>${place.formatted_address}</p>` : '';
  const openingHours = place.opening_hours ? `<p><i class="fas fa-clock icon"></i><strong>開放時間：</strong><br>${place.opening_hours.weekday_text.join('<br>')}</p>` : '';
  const rating = place.rating ? `<p><strong>評價：</strong><br>${getRatingStars(place.rating)} (${place.rating})</p>` : '';
  
  // 使用自定義價格範圍的函數
  const priceLevel = place.price_level !== undefined ? `<p><i class="fas fa-dollar-sign icon"></i>${getCustomPriceRange(place.price_level)}</p>` : '';

  const photoUrl = place.photos && place.photos.length > 0 ? place.photos[0].getUrl({maxWidth: 400}) : 'default.jpg';

  // 更新景點資訊，添加 CSS 類別
  const content = `
      <div class="attraction-item">
          <img src="${photoUrl}" alt="${name}" />
          <h3>${name}</h3>
          ${rating}
          ${priceLevel}
          ${address}
          ${openingHours}
          
      </div>
  `;

  // 替換 loading 樣式為實際內容
  loadingElement.outerHTML = content; // 使用 outerHTML 替換整個元素
}

// 定義自定義的價格範圍
function getCustomPriceRange(priceLevel) {
  switch (priceLevel) {
      case 1:
          return '價位相對低廉 ($) ';
      case 2:
          return '價位相對中等 ($$) ';
      case 3:
          return '價位相對偏高 ($$$) ';
      case 4:
          return '價位相對高價 ($$$$) ';
      default:
          return '無價格資訊';
  }
}

// 新增一個函數，用於將評分轉換為星級
function getRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5 ? true : false;
  let stars = '';

  for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star rating-stars"></i>';
  }
  if (halfStar) {
      stars += '<i class="fas fa-star-half-alt rating-stars"></i>';
  }

  return stars;
}


// ======================================
document.addEventListener('DOMContentLoaded', function() {
  
  var buttons = document.querySelectorAll('.large-text');

  
  buttons.forEach(function(button) {
      button.addEventListener('click', function() {
          
          this.classList.toggle('active');
      });
  });
});


