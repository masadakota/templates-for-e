// Minimal interaction logic for the CallFlow demo (no frameworks)

document.addEventListener('DOMContentLoaded', function () {
	const questionArea = document.getElementById('question-area');

	// Configuration loaded from JSON file (fallbacks provided)
	let CFG = null;

	// In-memory key-value state and persistence helper
	let STATE = {};
	// UI element for debugging state
	let statePanel = null;

	// Note: persistence to localStorage has been intentionally removed.

	function setKV(key, value) {
		STATE[key] = value;
		// Intentionally do NOT persist to localStorage per user request
		console.log('STATE updated (in-memory only):', key, value, STATE);
		renderStatePanel();
	}

	function createStatePanel() {
		if (statePanel) return;
		statePanel = document.createElement('div');
		statePanel.id = 'state-panel';
		statePanel.style.position = 'fixed';
		statePanel.style.right = '12px';
		statePanel.style.top = '12px';
		statePanel.style.width = '260px';
		statePanel.style.maxHeight = '60vh';
		statePanel.style.overflow = 'auto';
		statePanel.style.background = 'rgba(255,255,255,0.95)';
		statePanel.style.border = '1px solid #ccc';
		statePanel.style.padding = '8px';
		statePanel.style.fontFamily = 'monospace';
		statePanel.style.fontSize = '12px';
		statePanel.style.zIndex = '9999';

		const title = document.createElement('div');
		title.textContent = 'DEBUG STATE';
		title.style.fontWeight = 'bold';
		title.style.marginBottom = '6px';
		statePanel.appendChild(title);

		const pre = document.createElement('pre');
		pre.id = 'state-panel-pre';
		pre.style.whiteSpace = 'pre-wrap';
		pre.style.wordBreak = 'break-word';
		pre.style.margin = '0';
		statePanel.appendChild(pre);

		document.body.appendChild(statePanel);
	}

	function renderStatePanel() {
		if (!statePanel) createStatePanel();
		const pre = document.getElementById('state-panel-pre');
		if (pre) pre.textContent = JSON.stringify(STATE, null, 2);
	}

	function loadConfig() {
		// If a JS config object is provided (window.FLOW_CONFIG), use it. This allows
		// running the app from file:// without an HTTP server.
		if (window && window.FLOW_CONFIG) {
			CFG = window.FLOW_CONFIG;
			return Promise.resolve();
		}

		// Try to fetch the JSON config from /data/flow-config.json (relative to src)
		return fetch('data/flow-config.json')
			.then(function (res) {
				if (!res.ok) throw new Error('Config fetch failed: ' + res.status + ' ' + res.statusText);
				return res.json();
			})
			.then(function (json) {
				CFG = json;
			})
			.catch(function (err) {
				console.warn('Could not load config via fetch:', err);
				// If fetch failed but a global config exists (e.g. injected later), try that
				if (window && window.FLOW_CONFIG) {
					CFG = window.FLOW_CONFIG;
					return;
				}
				CFG = null;
				// preserve the error for later UI display
				loadConfig._lastError = err && err.message ? err.message : String(err);
			});
	}

	function showConfigLoadError() {
		// show a visible error in the question area so users see why nothing rendered
		clearArea();
		const block = createMessageBlock();
		const p = document.createElement('p');
		p.style.color = 'crimson';
		p.textContent = '設定ファイルを読み込めませんでした。HTTP サーバーで配信しているか、\nsrc/data/flow-config.json の存在を確認してください。詳細はコンソールを参照してください。';
		block.appendChild(p);
		questionArea.appendChild(block);
		console.error('Config load error:', loadConfig._lastError || 'unknown');
	}

	function cfg(path, fallback) {
		// simple helper to read nested config by path (like 'initial.text')
		if (!CFG) return fallback;
		const parts = path.split('.');
		let cur = CFG;
		for (let p of parts) {
			if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
			else return fallback;
		}
		return cur;
	}

	function clearArea() {
		questionArea.innerHTML = '';
	}

	function createButton(text, id) {
		const btn = document.createElement('button');
		btn.textContent = text;
		btn.className = 'button';
		if (id) btn.id = id;
		return btn;
	}

	function createMessageBlock() {
		const block = document.createElement('div');
		block.className = 'message-block';
		block.style.marginBottom = '12px';
		return block;
	}

	// Initial question replaces any previous content (loaded once or when reset)
	function showInitialQuestion() {
		clearArea();
		const block = createMessageBlock();

		// All content (text, buttons) must come from config
		const initialText = cfg('initial.text', null);
		if (!initialText) {
			console.error('Missing config: initial.text');
			return; // cannot render UI without initial question text
		}

		const q = document.createElement('p');
		q.textContent = initialText;
		// append the question text before buttons
		block.appendChild(q);

		const initialButtons = cfg('initial.buttons', null);
		if (!initialButtons || !Array.isArray(initialButtons) || initialButtons.length === 0) {
			console.error('Missing or invalid config: initial.buttons');
			return; // cannot render without initial buttons
		}

		// Create buttons in order. Buttons may include a kv mapping: { kv: { key, value } }
		initialButtons.forEach(function (b, idx) {
			const label = b.label || '';
			const action = b.action || '';
			const btn = createButton(label, 'btn-' + idx);

			// Attach click handler that sets 'initial' and any configured kv pair,
			// then dispatches the appropriate flow action.
			btn.addEventListener('click', function () {
				setKV('initial', action);
				if (b.kv && typeof b.kv.key === 'string') {
					setKV(b.kv.key, b.kv.value);
				}

				if (action === 'yes') onYes(block);
				else if (action === 'no') onNo(block);
			});

			block.appendChild(btn);
		});

		// question text and buttons already appended above

		questionArea.appendChild(block);
	}

	// When user selects "はい", append a new block below the existing content
	// Requirement change: no input + two buttons. Show only an 'OK' button.
	// On OK click append the manufacturer question below.
	function onYes(parentBlock) {
		const block = createMessageBlock();

		// All strings/labels must come from config (telephoneNumber section)
		const promptText = cfg('telephoneNumber.text', null);
		if (!promptText) {
			console.error('Missing config: telephoneNumber.text');
			return;
		}
		const q = document.createElement('p');
		q.textContent = promptText;

		// OK label: prefer telephoneNumber.buttons[0].label when configured
		let okLabel = 'OK';
		const telBtns = cfg('telephoneNumber.buttons', null);
		if (Array.isArray(telBtns) && telBtns.length > 0) okLabel = telBtns[0].label || okLabel;
		const ok = createButton(okLabel, 'btn-ok');

		ok.addEventListener('click', function () {
			// Prevent multiple manufacturer blocks from being appended by disabling OK
			ok.disabled = true;

			// record that the phone prompt was acknowledged
			setKV('phone_prompt', 'ok');


			const manuBlock = createMessageBlock();

			// manufacturer text paragraph (created only if config provides text)
			let m = null;
			const manuText = cfg('manufacturer.text', null);
			if (manuText) {
				m = document.createElement('p');
				m.textContent = manuText;
			}

			// Keep consistent UX: allow removing this manufacturer block
			const backLabel = cfg('manufacturer.backLabel', '戻る');
			const backManu = createButton(backLabel || '', 'btn-back-manu');
			backManu.addEventListener('click', function () {
				manuBlock.remove();
				ok.disabled = false; // allow appending again
			});

			// Create a select element with the requested manufacturers (from config)
			const select = document.createElement('select');
			select.id = 'manufacturer-select';
			select.style.display = 'block';
			select.style.margin = '8px 0';

			const defaultText = cfg('manufacturer.default', '未選択');
			if (defaultText !== null) {
				const defaultOption = document.createElement('option');
				defaultOption.value = '';
				defaultOption.textContent = defaultText;
				defaultOption.selected = true;
				select.appendChild(defaultOption);
			}

			const options = cfg('manufacturer.manufacturerOptions', null);
			if (Array.isArray(options)) {
				options.forEach(function (opt) {
					const o = document.createElement('option');
					o.value = opt;
					o.textContent = opt;
					select.appendChild(o);
				});
			}

			// record manufacturer selection to key-value store
			// key name is configurable in flow-config (manufacturer.kv_key)
			const manuKvKey = cfg('manufacturer.kv_key', 'manufacturer');
			let confirmP = null; // paragraph that shows "メーカーは◯◯ですね？"
			select.addEventListener('change', function (e) {
				const val = e.target.value;
				setKV(manuKvKey, val);

				// show or update confirmation text below the select
				if (val) {
					const tpl = cfg('manufacturerConfirm.text', null);
					if (tpl) {
						if (!confirmP) {
							confirmP = document.createElement('p');
							confirmP.className = 'manufacturer-confirm';
							manuBlock.insertBefore(confirmP, backManu);
						}
						confirmP.textContent = String(tpl).replace(/\{(?:manufacturer|value)\}/g, val);
					}
				} else if (confirmP) {
					confirmP.remove();
					confirmP = null;
				}
			});

			// append elements; only append the paragraph if it was created
			if (m) manuBlock.appendChild(m);
			manuBlock.appendChild(select);
			manuBlock.appendChild(backManu);
			questionArea.appendChild(manuBlock);
		});

		block.appendChild(q);
		block.appendChild(ok);

		questionArea.appendChild(block);
	}

	// When user selects "いいえ", append a notice below existing content
	function onNo(parentBlock) {
		const block = createMessageBlock();
		const noText = cfg('no.text', null);
		if (!noText) {
			console.error('Missing config: no.text');
			return;
		}
		const msg = document.createElement('p');
		msg.textContent = noText;

		const backLabel = cfg('no.backLabel', cfg('common.backLabel', null));
		if (!backLabel) {
			console.error('Missing config: no.backLabel or common.backLabel');
			return;
		}
		const back = createButton(backLabel, 'btn-back-no');
		back.addEventListener('click', function () {
			block.remove();
		});

		block.appendChild(msg);
		block.appendChild(back);

		questionArea.appendChild(block);
	}



	// initialize: load config then render (state is in-memory only)
	loadConfig().then(function () {
		if (!CFG) {
			showConfigLoadError();
		} else {
			showInitialQuestion();
		}
	});

	// create and render debug state panel initially
	renderStatePanel();
});