// script.js
(() => {
  'use strict';

  // --- Keys & State ---
  const LS_KEYS = {
    PWS:    'ironkey_passwords',
    MASTER: 'ironkey_master_password',
    PIN:    'ironkey_pin'
  };
  let passwords = [];
  let master    = '';
  let pin       = '';

  // --- DOM references ---
  const overlay        = document.getElementById('modal-overlay');
  const allModals      = document.querySelectorAll('.modal');
  const addBtn         = document.getElementById('add-password-btn');
  const viewBtn        = document.getElementById('view-passwords-btn');
  const exportBtns     = ['export-btn','export-footer-btn'].map(id => document.getElementById(id));
  const importBtns     = ['import-btn','import-footer-btn'].map(id => document.getElementById(id));
  const importInput    = document.getElementById('import-input');
  const settingsBtn    = document.getElementById('settings-btn');
  const setMasterBtn   = document.getElementById('set-master-btn');
  const changeMaster   = document.getElementById('change-master-btn');
  const setPinBtn      = document.getElementById('set-pin-btn');
  const changePinBtn   = document.getElementById('change-pin-btn');

  const addModal       = document.getElementById('add-password-modal');
  const viewModal      = document.getElementById('view-passwords-modal');
  const settingsModal  = document.getElementById('settings-modal');
  const masterModal    = document.getElementById('master-modal');
  const pinModal       = document.getElementById('pin-modal');

  const addForm        = document.getElementById('add-password-form');
  const masterForm     = document.getElementById('master-form');
  const pinForm        = document.getElementById('pin-form');
  const pwList         = document.getElementById('password-list');
  const toggleNewPw    = document.getElementById('toggle-new-password');
  const closeButtons   = document.querySelectorAll('.close-modal');

  // Master/PIN specific inputs
  const masterCurrentInput = document.getElementById('master-current');
  const masterNewInput     = document.getElementById('master-new');
  const pinCurrentInput    = document.getElementById('pin-current');
  const pinNewInput        = document.getElementById('pin-new');

  // --- Utility Functions ---
  function loadState() {
    passwords = JSON.parse(localStorage.getItem(LS_KEYS.PWS)    || '[]');
    master    = localStorage.getItem(LS_KEYS.MASTER) || '';
    pin       = localStorage.getItem(LS_KEYS.PIN)    || '';
  }

  function saveState() {
    localStorage.setItem(LS_KEYS.PWS,    JSON.stringify(passwords));
    localStorage.setItem(LS_KEYS.MASTER, master);
    localStorage.setItem(LS_KEYS.PIN,    pin);
  }

  function openModal(modal) {
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
  }

  function closeModals() {
    overlay.classList.add('hidden');
    allModals.forEach(m => m.classList.add('hidden'));
  }

  async function requireKey(promptText, allowed) {
    const input = prompt(promptText) || '';
    return allowed.includes(input);
  }

  function renderPasswordList() {
    pwList.innerHTML = '';
    if (passwords.length === 0) {
      pwList.textContent = 'No passwords saved.';
      return;
    }
    passwords.forEach((entry, idx) => {
      const row = document.createElement('div');
      row.className = 'entry';
      row.innerHTML = `
        <span>${entry.website}</span>
        <span>${entry.email}</span>
        <div class="password-field">
          <input type="password" value="${entry.password}" readonly>
          <button data-act="toggle">👁️</button>
        </div>
        <button data-act="copy">📋</button>
        <button data-act="del">🗑️</button>
      `;
      pwList.appendChild(row);
    });
  }

  function downloadBackup() {
    const backup = { master_password: master, pin, passwords };
    const blob   = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a');
    a.href       = url;
    a.download   = `ironkey_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Toggle Display of Set/Change Buttons ---
  function toggleCredentialButtons() {
    // Master password buttons
    if (master) {
      setMasterBtn.style.display    = 'none';
      changeMaster.style.display    = '';
    } else {
      setMasterBtn.style.display    = '';
      changeMaster.style.display    = 'none';
    }
    // PIN buttons
    if (pin) {
      setPinBtn.style.display       = 'none';
      changePinBtn.style.display    = '';
    } else {
      setPinBtn.style.display       = '';
      changePinBtn.style.display    = 'none';
    }
  }

  // --- Initialization ---
  loadState();
  toggleCredentialButtons();

  // --- Global Listeners ---
  overlay.addEventListener('click', closeModals);
  closeButtons.forEach(b => b.addEventListener('click', closeModals));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModals(); });

  // --- Dashboard Buttons ---
  addBtn.addEventListener('click', () => openModal(addModal));
  viewBtn.addEventListener('click', async () => {
    if (!await requireKey('Enter PIN to view passwords:', [pin])) {
      return alert('Incorrect PIN.');
    }
    renderPasswordList();
    openModal(viewModal);
  });
  settingsBtn.addEventListener('click', () => openModal(settingsModal));

  // --- Master Password Flow ---
  function prepareMasterModal(isChange) {
    masterForm.reset();
    const needsCurrent = isChange || Boolean(master);
    masterCurrentInput.required = needsCurrent;
    masterCurrentInput.style.display = needsCurrent ? '' : 'none';
    openModal(masterModal);
  }

  setMasterBtn.addEventListener('click', () => prepareMasterModal(false));
  changeMaster.addEventListener('click', () => prepareMasterModal(true));

  masterForm.addEventListener('submit', e => {
    e.preventDefault();
    const curr = masterCurrentInput.value;
    const nw   = masterNewInput.value.trim();
    if (master && curr !== master) {
      return alert('Incorrect current Master Password.');
    }
    if (!nw) {
      return alert('New Master Password cannot be empty.');
    }
    master = nw;
    saveState();
    toggleCredentialButtons();
    alert('Master Password saved.');
    closeModals();
  });

  // --- PIN Flow ---
  function preparePinModal(isChange) {
    pinForm.reset();
    const needsCurrent = isChange || Boolean(pin);
    pinCurrentInput.required = needsCurrent;
    pinCurrentInput.style.display = needsCurrent ? '' : 'none';
    openModal(pinModal);
  }

  setPinBtn.addEventListener('click', () => preparePinModal(false));
  changePinBtn.addEventListener('click', () => preparePinModal(true));

  pinForm.addEventListener('submit', e => {
    e.preventDefault();
    const curr = pinCurrentInput.value;
    const nw   = pinNewInput.value.trim();
    if (pin && curr !== pin && curr !== master) {
      return alert('Incorrect current PIN.');
    }
    if (!/^\d{4}$/.test(nw)) {
      return alert('New PIN must be exactly 4 digits.');
    }
    pin = nw;
    saveState();
    toggleCredentialButtons();
    alert('PIN saved.');
    closeModals();
  });

  // --- Add Password Flow ---
  toggleNewPw.addEventListener('click', () => {
    const pw = document.getElementById('new-password');
    pw.type = pw.type === 'password' ? 'text' : 'password';
  });

  addForm.addEventListener('submit', e => {
    e.preventDefault();
    const site   = document.getElementById('website').value.trim();
    const mail   = document.getElementById('email').value.trim();
    const pwd    = document.getElementById('new-password').value;
    const pinIn  = document.getElementById('pin-input-add').value;
    if (!site || !mail || !pwd) {
      return alert('All fields are required.');
    }
    if (pinIn !== pin) {
      return alert('Incorrect PIN.');
    }
    passwords.push({ website: site, email: mail, password: pwd });
    saveState();
    addForm.reset();
    alert('Password saved.');
    closeModals();
  });

  // --- Manage Saved Passwords ---
  pwList.addEventListener('click', async ev => {
    const action = ev.target.dataset.act;
    if (!action) return;
    const entryEl = ev.target.closest('.entry');
    const idx     = Array.from(pwList.children).indexOf(entryEl);
    const data    = passwords[idx];

    if (action === 'toggle') {
      const inp = entryEl.querySelector('input');
      inp.type = inp.type === 'password' ? 'text' : 'password';
    }

    if (action === 'copy') {
      navigator.clipboard.writeText(data.password)
        .then(() => alert('Copied to clipboard.'))
        .catch(() => alert('Copy failed.'));
    }

    if (action === 'del') {
      if (!await requireKey('Enter PIN to delete:', [pin])) {
        return alert('Incorrect PIN.');
      }
      passwords.splice(idx, 1);
      saveState();
      renderPasswordList();
    }
  });

  // --- Export / Import ---
  exportBtns.forEach(b => b.addEventListener('click', downloadBackup));
  importBtns.forEach(b => b.addEventListener('click', () => importInput.click()));

  importInput.addEventListener('change', () => {
    const file = importInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const obj = JSON.parse(reader.result);
        if (!await requireKey('Enter Master Password or PIN to restore:', [master, pin])) {
          throw new Error('Auth failed');
        }
        master    = obj.master_password || '';
        pin       = obj.pin              || '';
        passwords = Array.isArray(obj.passwords) ? obj.passwords : [];
        saveState();
        toggleCredentialButtons();
        alert('Data restored.');
      } catch {
        alert('Restore failed.');
      }
    };
    reader.readAsText(file);
    importInput.value = '';
  });

})(); // end IIFE

// Secure reset is kept global so it can be called from inline onclick
function secureReset() {
  const modal = document.getElementById('master-password-modal');
  const form = document.getElementById('master-password-form');
  const input = document.getElementById('master-password-input');
  const closeButtons = modal.querySelectorAll('.close-modal');

  modal.classList.remove('hidden');
  input.focus();

  closeButtons.forEach(btn => {
    btn.onclick = () => {
      modal.classList.add('hidden');
      form.reset();
    };
  });

  form.onsubmit = (e) => {
    e.preventDefault();
    const enteredPassword = input.value;
    const storedPassword = localStorage.getItem('ironkey_master_password');

    if (enteredPassword === storedPassword) {
      localStorage.removeItem('ironkey_passwords');
      localStorage.removeItem('ironkey_master_password');
      localStorage.removeItem('ironkey_pin');
      alert('✅ All data cleared. Reloading the app...');
      location.reload();
    } else {
      alert('❌ Incorrect Master Password.');
      input.value = '';
      input.focus();
    }
  };
}
