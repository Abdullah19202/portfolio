// Select important DOM elements for interaction
const nav = document.querySelector('.nav'); // main nav element
const toggle = document.querySelector('.nav-toggle'); // mobile menu button
const navLinks = document.querySelectorAll('.nav-links a'); // all nav anchor links
const header = document.querySelector('.site-header'); // header used for height calculations

// Helper: update CSS variable for header height so anchors account for fixed header
function updateHeaderHeight(){
  // measure header and store in root CSS variable --header-height
  const h = header.getBoundingClientRect().height;
  document.documentElement.style.setProperty('--header-height', h + 'px');
}

// Toggle mobile navigation open/closed
toggle.addEventListener('click', () => {
  // toggle an open class on nav to control mobile menu visibility
  nav.classList.toggle('open');
  // update aria attribute for accessibility
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!expanded));
});

// Smooth scrolling with header offset for all nav links
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    // allow normal behaviour for external links (href starts with http)
    const href = link.getAttribute('href');
    if(!href || href.startsWith('http')) return;

    // prevent default anchor jump
    e.preventDefault();

    // close mobile nav after clicking a link (if open)
    if(nav.classList.contains('open')){
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    // find the target element by id and compute scroll position
    const target = document.querySelector(href);
    if(!target) return;
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;
    const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 8; // small extra offset

    // scroll smoothly to the computed position
    window.scrollTo({top, behavior: 'smooth'});
  });
});

// Contact form handling: simple client-side validation and success message
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); // we will submit via fetch to Formspree

  // basic validation: check required fields
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  if(!name || !email || !message){
    status.textContent = 'Please fill all required fields.';
    status.style.color = 'tomato';
    return;
  }

  // disable submit button and show sending state
  const submitBtn = form.querySelector('button[type="submit"]');
  if(submitBtn) submitBtn.disabled = true;
  status.style.color = '';
  status.textContent = 'Sending...';

  try {
    const formData = new FormData(form);
    const resp = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if(resp.ok){
      status.textContent = 'Thanks! Your message was sent.';
      status.style.color = 'green';
      form.reset();
    } else {
      const data = await resp.json().catch(() => null);
      status.textContent = (data && data.error) ? `Error: ${data.error}` : 'Oops! There was a problem sending your message.';
      status.style.color = 'tomato';
    }
  } catch (err) {
    status.textContent = 'Network error. Please try again later.';
    status.style.color = 'tomato';
  } finally {
    if(submitBtn) submitBtn.disabled = false;
  }
});

// Set current year in footer (small usability nicety)
document.getElementById('year').textContent = new Date().getFullYear();

// Update header height on load and resize so CSS offsets are correct
window.addEventListener('load', updateHeaderHeight);
window.addEventListener('resize', updateHeaderHeight);
