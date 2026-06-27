/**
 * faq.js — renders the FAQ tab as an interactive accordion.
 * 
 * Expected columns in the FAQ sheet:
 *   - Question (the Q)
 *   - Answer (the A)
 */

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
            aria-expanded="false" 
            aria-controls="${answerId}"
            onclick="toggleFAQ(this)">
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

    // Attach click handler to all FAQ items
    document.querySelectorAll('.faq-question').forEach((btn) => {
      btn.addEventListener('click', function () {
        toggleFAQ(this);
      });
    });
  } catch (err) {
    console.error(err);
    mount.innerHTML = `<div class="empty-state">Couldn't load FAQs right now. Make sure the Google Sheet is shared as "Anyone with the link — Viewer."</div>`;
  }
}

window.toggleFAQ = function(button) {
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  const answerId = button.getAttribute('aria-controls');
  const answer = document.getElementById(answerId);

  if (!answer) return;

  button.setAttribute('aria-expanded', String(!isExpanded));

  if (isExpanded) {
    // Collapse
    answer.style.maxHeight = '0px';
    button.classList.remove('open');
  } else {
    // Expand
    answer.style.maxHeight = answer.scrollHeight + 'px';
    button.classList.add('open');
  }
}

document.addEventListener('DOMContentLoaded', loadFAQ);
