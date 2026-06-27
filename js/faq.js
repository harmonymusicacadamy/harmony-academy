/**
 * faq.js — renders the FAQ tab as an interactive accordion.
 * 
 * Expected columns in the FAQ sheet:
 *   - Question (the Q)
 *   - Answer (the A)
 */

// Global function for FAQ toggle — must be accessible from onclick handlers
window.toggleFAQ = function(button) {
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  const answerId = button.getAttribute('aria-controls');
  const answer = document.getElementById(answerId);

  if (!answer) {
    console.warn('Answer element not found:', answerId);
    return false;
  }

  // Toggle expanded state
  button.setAttribute('aria-expanded', String(!isExpanded));

  if (isExpanded) {
    // Collapse
    answer.style.maxHeight = '0px';
    button.classList.remove('open');
  } else {
    // Expand — set max-height to content height
    const contentHeight = answer.scrollHeight;
    answer.style.maxHeight = contentHeight + 'px';
    button.classList.add('open');
    
    // Re-calculate if content changes (e.g., images load)
    setTimeout(() => {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }, 100);
  }
  
  return false;
};

async function loadFAQ() {
  const mount = document.getElementById('faqAccordion');
  if (!mount) return;

  try {
    const rows = await fetchSheetTab(SITE_CONFIG.TABS.FAQ);

    if (rows.length === 0) {
      mount.innerHTML = `<div class="empty-state">No FAQs yet — add rows to the "${SITE_CONFIG.TABS.FAQ}" tab with columns: Question, Answer.</div>`;
      return;
    }

    mount.innerHTML = rows
      .map((row, index) => {
        const questionId = `faq-q-${index}`;
        const answerId = `faq-a-${index}`;
        return `
        <article class="faq-item reveal in-view">
          <button 
            class="faq-question" 
            id="${questionId}"
            type="button"
            aria-expanded="false" 
            aria-controls="${answerId}"
            onclick="window.toggleFAQ(this); return false;">
            <span class="faq-text">${escapeHtml(row.Question)}</span>
            <span class="faq-toggle" aria-hidden="true">+</span>
          </button>
          <div 
            class="faq-answer" 
            id="${answerId}" 
            role="region"
            aria-labelledby="${questionId}"
            style="max-height: 0; overflow: hidden;">
            <div class="faq-answer-content">
              ${escapeHtml(row.Answer).replace(/\n/g, '<br>')}
            </div>
          </div>
        </article>`;
      })
      .join('');

  } catch (err) {
    console.error('FAQ Load Error:', err);
    mount.innerHTML = `<div class="empty-state">Couldn't load FAQs right now. Make sure the Google Sheet is shared as "Anyone with the link — Viewer."</div>`;
  }
}

// Load FAQs when page is ready
document.addEventListener('DOMContentLoaded', loadFAQ);
