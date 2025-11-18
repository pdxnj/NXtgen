document.addEventListener('DOMContentLoaded', function(){
  // Discount modal popup - show after 2 seconds
  setTimeout(function(){
    const modal = document.getElementById('discountModal');
    if(modal && !localStorage.getItem('ng_discount_shown')){  
      modal.classList.add('active');
      localStorage.setItem('ng_discount_shown', 'true');
    }
  }, 2000);

  const discountForm = document.getElementById('discountForm');
  if(discountForm){
    discountForm.addEventListener('submit', function(e){
      e.preventDefault();
      const name = discountForm.discountName.value.trim();
      const email = discountForm.discountEmail.value.trim();
      const phone = discountForm.discountPhone.value.trim();
      const service = discountForm.discountService.value.trim();
      if(!name || !email || !phone){
        alert('Please fill out all required fields.');
        return;
      }
      // Store discount info
      const discountInfo = {
        name: name,
        email: email,
        phone: phone,
        service: service,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('ng_discount_customer', JSON.stringify(discountInfo));
      alert('Thanks, ' + name + '! Your 5% discount code has been sent to ' + email + '. We will be in touch soon!');
      document.getElementById('discountModal').classList.remove('active');
      discountForm.reset();
    });
  }

  const form = document.getElementById('contactForm');
  if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if(!name || !email || !message){
      alert('Please fill out all fields.');
      return;
    }
    // Simple simulated send — replace with real backend integration.
    alert('Thanks, ' + name + '! Your message was submitted. We will reply to ' + email + '.');
    form.reset();
  });
  
  // Reviews panel toggle
  const reviewsButton = document.querySelector('.reviews-button');
  const reviewsPanel = document.querySelector('.reviews-panel');
  const reviewsClose = document.querySelector('.reviews-close');
  if(reviewsButton && reviewsPanel){
    reviewsButton.addEventListener('click', function(e){
      e.preventDefault();
      reviewsPanel.classList.toggle('open');
    });
  }
  if(reviewsClose && reviewsPanel){
    reviewsClose.addEventListener('click', function(){ reviewsPanel.classList.remove('open') });
  }

  // Reviews: load/store and form handling (localStorage)
  const reviewsListEl = document.getElementById('reviewsList');
  const ratingValueEl = document.getElementById('ratingValue');
  const ratingCountEl = document.getElementById('ratingCount');
  const reviewForm = document.getElementById('reviewForm');

  function loadStoredReviews(){
    try{
      const raw = localStorage.getItem('ng_reviews');
      return raw ? JSON.parse(raw) : null;
    }catch(e){return null}
  }

  function saveReviews(arr){ localStorage.setItem('ng_reviews', JSON.stringify(arr)) }

  function calcAverage(arr){
    if(!arr || arr.length===0) return 0;
    const sum = arr.reduce((s,r)=>s+Number(r.rating),0);
    return Math.round((sum/arr.length)*10)/10;
  }

  function renderReviews(arr){
    if(!reviewsListEl) return;
    reviewsListEl.innerHTML = '';
    arr.forEach(r=>{
      const li = document.createElement('li');
      const meta = document.createElement('div'); meta.className='review-meta'; meta.textContent = `${r.name} — ${Number(r.rating).toFixed(1)} ★`;
      const p = document.createElement('p'); p.className='review-text'; p.textContent = r.text;
      li.appendChild(meta); li.appendChild(p); reviewsListEl.appendChild(li);
    })
  }

  // Initialize reviews state: prefer stored reviews, otherwise keep initial HTML and build an array
  let reviewsArr = [];
  const stored = loadStoredReviews();
  if(stored && Array.isArray(stored) && stored.length>0){
    reviewsArr = stored;
    renderReviews(reviewsArr);
  } else {
    // read existing DOM items into array as initial seed
    if(reviewsListEl){
      const items = Array.from(reviewsListEl.querySelectorAll('li'));
      reviewsArr = items.map(li=>{
        const meta = li.querySelector('.review-meta');
        const text = li.querySelector('.review-text')?.textContent || '';
        let name = 'Anonymous'; let rating = 5;
        if(meta){
          const parts = meta.textContent.split('—');
          name = (parts[0]||'').trim(); rating = parseFloat((parts[1]||'5').replace('★','').trim())||5;
        }
        return {name, rating, text};
      })
      // save seed to localStorage so we can update later
      saveReviews(reviewsArr);
    }
  }

  // show initial average
  function updateRatingDisplay(){
    const avg = calcAverage(reviewsArr) || 0;
    const count = reviewsArr.length;
    if(ratingValueEl) ratingValueEl.textContent = avg.toFixed(1);
    if(ratingCountEl) ratingCountEl.textContent = `Based on ${count} reviews`;
  }
  updateRatingDisplay();

  if(reviewForm){
    reviewForm.addEventListener('submit', function(e){
      e.preventDefault();
      const name = (reviewForm.reviewerName.value || 'Anonymous').trim();
      const rating = Number(reviewForm.reviewRating.value || 5);
      const text = (reviewForm.reviewText.value || '').trim();
      if(!text){ alert('Please write a short review.'); return; }
      const newReview = { name, rating, text };
      // prepend newest
      reviewsArr.unshift(newReview);
      saveReviews(reviewsArr);
      renderReviews(reviewsArr);
      updateRatingDisplay();
      reviewForm.reset();
      if(reviewsPanel) reviewsPanel.classList.add('open');
    })
  }
});
