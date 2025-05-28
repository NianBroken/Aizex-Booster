// ==UserScript==
// @name         Aizex增强插件
// @namespace    https://www.klaio.top/
// @version      1.0.0
// @description  Aizex Booster 是一款专门为 Aizex 镜像站 开发的浏览器扩展插件。它提供了一系列实用的增强功能，包括实时积分显示、界面元素的显示与隐藏控制、整体界面布局优化及自定义头像等。这些功能能够有效提升用户的浏览体验，让界面使用更加流畅、高效且富有个性化特色。
// @author       NianBroken
// @match        *://*.mana-x.aizex.net/*
// @match        *://*.arc-x.aizex.me/*
// @match        *://*.leopard-x.memofun.net/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      aizex.me
// @run-at       document-start
// @icon         https://aizex.me/favicon.ico
// @homepageURL  https://github.com/NianBroken/Aizex-Booster
// @supportURL   https://github.com/NianBroken/Aizex-Booster/issues
// @copyright    Copyright © 2025 NianBroken. All rights reserved.
// @license      Apache-2.0 license
// ==/UserScript==



(function () {
	'use strict';

	// ===================================================================================
	// === 全局配置 (CONSTANTS & CONFIGURATION) ===
	// ===================================================================================
	// 本区域集中了所有用户将来可能需要调整的参数。
	// 修改前请务必理解各参数的含义及其对脚本功能的影响。
	// ===================================================================================
	const CONFIG = {
		// --- 脚本基础信息 ---
		SCRIPT_NAME: 'Aizex增强插件', // 脚本名称，用于日志输出等场合，方便识别。
		SCRIPT_VERSION: '1.0.0', // 脚本版本号，用于日志输出和问题追踪。

		// --- 目标元素选择器 (CSS Selectors) ---
		// 这些选择器用于在目标网页上定位特定的HTML元素。
		// !! 警告：如果目标网站的HTML结构发生变化，导致这些选择器失效，脚本的相应功能将无法正常工作。!!
		// !! 在不完全理解其作用前，请勿随意修改这些路径，以免导致功能异常。!!
		SELECTORS: {
			// “高级设置”按钮将被注入到此选择器指向的容器的起始位置。
			ADVANCED_SETTINGS_BUTTON_TARGET_CONTAINER: "#conversation-header-actions",
			// “高级设置”按钮将尝试复制此选择器指向的按钮的样式。
			ADVANCED_SETTINGS_BUTTON_STYLE_REFERENCE: "#conversation-header-actions .btn-secondary",
			// “积分显示”面板将被注入到此选择器指向的容器的末尾。
			POINTS_PANEL_TARGET_CONTAINER: "body > div.flex.h-full.w-full.flex-col > div > div.relative.flex.h-full.w-full.flex-row.overflow-hidden > div.bg-token-sidebar-surface-primary.z-21.shrink-0.overflow-x-hidden.\\[view-transition-name\\:var\\(--sidebar-slideover\\)\\].max-md\\:w-0\\! > div > div > div > nav",
			// “隐藏侧边工具栏入口”功能将尝试移除此选择器指向的按钮。
			SIDEBAR_TOGGLE_BUTTON: "#toggleButton",
			// “隐藏滚动至末尾按钮”功能将尝试移除此选择器指向的按钮。
			SCROLL_TO_END_BUTTON: "#thread > div > div.flex.shrink.basis-auto.flex-col.overflow-hidden.-mb-\\(--composer-overlap-px\\).\\[--composer-overlap-px\\:24px\\].grow > div > div.sticky.bottom-6.z-10.flex.h-0.items-end.justify-center.motion-safe\\:transition-all.motion-safe\\:delay-300.motion-safe\\:duration-300.group-\\[\\:not\\(\\[data-scroll-from-end\\]\\)\\]\\/thread\\:scale-50.group-\\[\\:not\\(\\[data-scroll-from-end\\]\\)\\]\\/thread\\:opacity-0.group-\\[\\:not\\(\\[data-scroll-from-end\\]\\)\\]\\/thread\\:pointer-events-none.group-\\[\\:not\\(\\[data-scroll-from-end\\]\\)\\]\\/thread\\:duration-100.group-\\[\\:not\\(\\[data-scroll-from-end\\]\\)\\]\\/thread\\:delay-0 > button",
			// “优化界面”功能将尝试移除此选择器指向的元素，并用一个占位符替换。
			OPTIMIZE_UI_TARGET_ELEMENT: "#thread-bottom-container > div.text-token-text-secondary.relative.mt-auto.flex.min-h-8.w-full.items-center.justify-center.p-2.text-center.text-xs.md\\:px-\\[60px\\]",
			// “自定义头像”功能将修改此选择器指向的<img>元素的src属性。
			// 使用 data-testid 和 alt 属性进行定位，期望能比动态ID更稳定。
			CUSTOM_AVATAR_IMAGE: 'button[data-testid="profile-button"] img[alt="User"]',
		},

		// --- 脚本创建元素的ID ---
		// 为脚本动态创建的DOM元素分配的ID，用于后续的查找、修改或移除操作。
		// 保持这些ID的独特性，以避免与页面原有元素的ID冲突。
		ELEMENT_IDS: {
			ADVANCED_SETTINGS_BUTTON: 'aizex-enhancer-adv-settings-btn',
			SETTINGS_PANEL: 'aizex-enhancer-settings-panel',
			SCROLLABLE_CONTENT_AREA: 'aizex-enhancer-scrollable-content',
			OVERLAY: 'aizex-enhancer-overlay',
			QUOTA_PANEL_CONTAINER: 'aizex-enhancer-quota-panel',
			OPTIMIZE_UI_PLACEHOLDER: 'aizex-enhancer-optimize-ui-placeholder',
		},

		// --- 本地存储键名 ---
		// 用于在油猴脚本管理器提供的存储中保存用户设置和缓存数据。
		// 修改这些键名将导致用户之前保存的设置和数据无法被脚本识别。
		STORAGE_KEYS: {
			MAIN_SETTINGS: 'aizex_enhancer_settings_v1.0.0', // 主设置对象存储键
			QUOTA_DATA: 'aizex_enhancer_quota_data_v1.0.0', // 积分数据对象存储键
		},

		// --- API 相关配置 ---
		API: {
			QUOTA_URL: 'https://aizex.me/be/auth/get-quota', // 获取积分数据的接口地址
			TIMEOUT_MS: 15000, // API请求的超时时间（单位：毫秒）
			QUOTA_AUTO_REFRESH_INTERVAL_S: 30, // 积分数据自动刷新的时间间隔（单位：秒）
		},

		// --- 自定义头像功能相关属性名 ---
		// 在被修改的头像<img>元素上添加这些自定义HTML属性，用于追踪脚本的操作状态。
		CUSTOM_AVATAR_ATTRIBUTES: {
			APPLIED: 'data-aizex-enhancer-avatar-applied', // 标记此<img>已被自定义头像替换
			// FALLBACK_SRC: 'data-aizex-enhancer-original-src', // 已根据用户新需求移除
		},

		// --- 积分面板UI默认及占位符值 ---
		// 当无法从API获取有效数据，且本地也无缓存或缓存数据不完整时，积分面板中对应项显示的文本。
		POINTS_PANEL_DEFAULTS: {
			TIME_STRING: '1970-01-01 00:00:00', // 时间戳无效或缺失时的默认显示时间
			MAX_QUOTA_FALLBACK: "None", // 当最大积分值未知时的最终回退显示值
			USED_FALLBACK: "None", // 当已用积分值未知时的最终回退显示值
			NONE_PLACEHOLDER: "None", // 当某个具体数值或信息缺失时的通用占位符
		},

		// --- UI文本字符串 ---
		// 设置面板等UI界面上显示的固定文本。便于统一管理和未来可能的修改。
		TEXT: {
			ADV_SETTINGS_BUTTON: '高级设置',
			SETTINGS_PANEL_TITLE: 'Aizex增强插件',
			CLOSE_PANEL_BUTTON: '关闭面板',
			AVATAR_BTN_SELECT: '选择文件',
			AVATAR_BTN_SELECTED: '已设置头像',
			AVATAR_BTN_RESET: '重置',
			SETTING_ITEM_TITLES: { // 各设置项在面板中的显示标题
				showPoints: '开启积分显示',
				hideSidebarEntry: '隐藏侧边工具栏入口',
				hideScrollToEnd: '隐藏滚动至末尾按钮',
				optimizeUI: '优化界面',
				enableLogging: '开启日志输出',
				customAvatar: '自定义头像',
			}
		},
	};

	// --- 默认设置对象 ---
	// 定义了脚本所有可配置项的初始默认状态。
	// 确保所有功能性开关默认为关闭 (false)，符合用户要求。
	const DEFAULT_SETTINGS = {
		showPoints: false, // 是否显示积分面板
		hideSidebarEntry: false, // 是否隐藏侧边栏入口按钮(#toggleButton)
		hideScrollToEnd: false, // 是否隐藏“滚动至末尾”按钮
		optimizeUI: false, // 是否启用界面优化（移除特定页脚元素并替换为占位符）
		enableLogging: false, // 是否在控制台输出详细日志
		customAvatar: null, // 自定义头像数据 { isSet: boolean, originalName?: string, dataUrl?: string }
	};

	// --- 全局状态变量 ---
	let currentSettings = {
		...DEFAULT_SETTINGS
	}; // 存储当前所有设置项的值
	let previousUrl = window.location.href; // 用于检测浏览器地址栏URL的变化

	// 各独立功能模块的状态标志
	let isPointsDisplayFeatureActive = false; // 积分显示功能是否已实际激活并运行
	let isHideSidebarEntryFeatureActive = false; // 隐藏侧边栏入口功能是否已实际激活并运行
	let isHideScrollToEndButtonFeatureActive = false; // 隐藏滚动至末尾按钮功能是否已实际激活并运行
	let isOptimizeUIFeatureActive = false; // 优化界面功能是否已实际激活并运行
	// 自定义头像功能的激活状态直接通过 currentSettings.customAvatar.dataUrl 是否存在来判断

	// 积分功能相关状态
	let lastQuotaData = null; // 上次成功从API获取或本地加载的积分数据
	let isQuotaRequestPending = false; // 标记当前是否有积分API请求正在进行中，用于请求锁定
	let autoRefreshTimerId = null; // 积分数据自动刷新的 setInterval ID
	let autoRefreshCountdown = CONFIG.API.QUOTA_AUTO_REFRESH_INTERVAL_S; // 自动刷新倒计时

	// MutationObserver 实例，用于异步等待特定DOM元素的出现
	let mainSettingsButtonObserver = null;
	let pointsPanelTargetObserver = null;
	let toggleButtonObserver = null;
	let scrollToEndButtonObserver = null;
	let optimizeUITargetObserver = null;
	let customAvatarObserver = null;

	// ===================================================================================
	// === 工具函数 (Utilities) ===
	// ===================================================================================

	/**
	 * @description 标准化的日志输出函数。仅当 CONFIG.DEFAULT_SETTINGS.enableLogging (通过 currentSettings 反映) 为 true 时执行。
	 * 所有日志输出均以此函数为入口，确保格式统一和条件输出。
	 * @param {string} functionName - 调用日志的函数名，用于日志追溯。
	 * @param {string} message - 要输出的核心日志消息。
	 * @param {...any} [args] - (可选) 附加的日志参数，可以是任何类型，会追加在核心消息后。
	 */
	function log(functionName, message, ...args) {
		if (currentSettings.enableLogging) {
			const timestamp = new Date().toLocaleString(); // 使用浏览器本地时区和时间格式
			// 为确保可读性，函数名和消息之间用冒号分隔，附加参数直接传递给 console.log
			console.log(`[${CONFIG.SCRIPT_NAME} v${CONFIG.SCRIPT_VERSION}] ${timestamp} [${functionName}]: ${message}`, ...args);
		}
	}

	// ===================================================================================
	// === 设置管理 (Settings Management) ===
	// ===================================================================================

	/**
	 * @description 从Tampermonkey的存储中异步加载脚本的设置。
	 * 如果存储中没有设置或设置格式不正确，则使用 DEFAULT_SETTINGS 并将其保存回存储。
	 * 此函数应在脚本初始化早期被调用。
	 */
	async function loadSettings() {
		const FN = 'loadSettings'; // 当前函数名，用于日志
		log(FN, '函数开始执行。准备从本地存储加载主设置。');
		log(FN, '  存储键名:', CONFIG.STORAGE_KEYS.MAIN_SETTINGS);
		try {
			const savedSettings = await GM_getValue(CONFIG.STORAGE_KEYS.MAIN_SETTINGS);
			log(FN, '  从 GM_getValue 获取的原始主设置数据:', savedSettings);

			if (savedSettings && typeof savedSettings === 'object' && Object.keys(savedSettings).length > 0) {
				// 使用保存的设置，并用默认设置补充任何可能缺失的新设置项
				currentSettings = {
					...DEFAULT_SETTINGS,
					...savedSettings
				};
				log(FN, '  成功合并已保存的主设置与默认设置。当前生效的设置为:', currentSettings);
			} else {
				// 无有效保存设置，使用全新默认设置
				currentSettings = {
					...DEFAULT_SETTINGS
				};
				log(FN, '  本地存储中未找到有效的主设置、格式错误或为空对象。已恢复使用全新的默认主设置:', currentSettings);
				// 将全新的默认设置保存到存储中，供下次加载
				await GM_setValue(CONFIG.STORAGE_KEYS.MAIN_SETTINGS, currentSettings);
				log(FN, '  全新的默认主设置已自动保存至本地存储。');
			}
		} catch (error) {
			// 捕获 GM_getValue 或 GM_setValue 可能抛出的异常
			console.error(`[${CONFIG.SCRIPT_NAME}] ${new Date().toLocaleString()}: ${FN}: 加载主设置时发生严重错误:`, error);
			currentSettings = {
				...DEFAULT_SETTINGS
			}; // 任何异常均回退到默认设置，保证脚本基本可用性
			log(FN, '  加载主设置过程中发生异常，已强制恢复为默认主设置:', currentSettings);
		}
		log(FN, '主设置加载完成。最终 currentSettings 内容:', currentSettings);

		// 特殊处理日志设置的初始状态输出，确保用户了解如何开启日志
		if (currentSettings.enableLogging) {
			log(FN, '根据已加载的设置，日志输出功能当前为：已激活。');
		} else {
			// 此条 console.log 会在 enableLogging 为 false 时也输出，作为对用户的提示
			console.log(`[${CONFIG.SCRIPT_NAME} v${CONFIG.SCRIPT_VERSION}] ${new Date().toLocaleString()}: 日志输出功能当前为：未激活。如需查看详细操作日志，请在插件“${CONFIG.TEXT.ADV_SETTINGS_BUTTON}”面板中的“${CONFIG.TEXT.SETTING_ITEM_TITLES.enableLogging}”项将其开启。`);
		}
		log(FN, '函数执行完毕。');
	}

	/**
	 * @description 保存单个设置项的值。
	 * 更新内存中的 currentSettings 对象，然后将其完整地持久化到Tampermonkey存储。
	 * 在值更新后，会根据被修改的设置项键名，调用相应的功能模块切换函数。
	 * @param {string} key - 要保存的设置项的键名 (必须是 DEFAULT_SETTINGS 中的一个键)。
	 * @param {any} value - 要保存的设置项的新值。
	 */
	async function saveSetting(key, value) {
		const FN = 'saveSetting';
		log(FN, `函数开始执行。准备保存设置项 - 键: "${key}"。`);
		log(FN, `  保存前，键 "${key}" 在 currentSettings 中的当前值为:`, currentSettings[key]);
		log(FN, `  即将为键 "${key}" 设置的新值为:`, value);

		currentSettings[key] = value; // 步骤1: 更新内存中的设置对象

		try {
			// 步骤2: 将整个更新后的 currentSettings 对象持久化保存
			await GM_setValue(CONFIG.STORAGE_KEYS.MAIN_SETTINGS, currentSettings);
			log(FN, `  主设置对象已成功通过 GM_setValue 持久化保存。键: "${key}" 的新值已在存储中生效。`);
			log(FN, "  当前完整的 currentSettings 对象内容:", currentSettings);
		} catch (error) {
			console.error(`[${CONFIG.SCRIPT_NAME}] ${new Date().toLocaleString()}: ${FN}: 保存主设置时发生严重错误 - 键: "${key}"`, error);
			log(FN, `  持久化保存主设置失败! 键: "${key}", 值:`, value, "错误详情:", error);
		}

		// 步骤3: 根据被修改的设置项，触发相应功能模块的逻辑切换
		log(FN, `  检查键 "${key}" 是否需要触发特定功能模块的状态更新...`);
		switch (key) {
			case 'showPoints':
				log(FN, `  检测到 "${key}" (积分显示) 设置项被更改为 ${value}，将调用 togglePointsDisplayFeature。`);
				togglePointsDisplayFeature(value);
				break;
			case 'hideSidebarEntry':
				log(FN, `  检测到 "${key}" (隐藏侧边栏入口) 设置项被更改为 ${value}，将调用 toggleHideSidebarEntryFeature。`);
				toggleHideSidebarEntryFeature(value);
				break;
			case 'hideScrollToEnd':
				log(FN, `  检测到 "${key}" (隐藏滚动至末尾按钮) 设置项被更改为 ${value}，将调用 toggleHideScrollToEndButtonFeature。`);
				toggleHideScrollToEndButtonFeature(value);
				break;
			case 'optimizeUI':
				log(FN, `  检测到 "${key}" (优化界面) 设置项被更改为 ${value}，将调用 toggleOptimizeUIFeature。`);
				toggleOptimizeUIFeature(value);
				break;
			case 'customAvatar':
				log(FN, `  检测到 "${key}" (自定义头像) 设置项被更改。新值详情:`, value);
				if (value && value.dataUrl) { // 如果设置了新头像（包含dataUrl）
					log(FN, '    新头像数据包含有效的 dataUrl，将尝试将其应用到页面上。');
					applyCustomAvatarToPage();
				} else { // 如果是重置头像 (value 为 null 或无效)
					log(FN, '    自定义头像数据被清除 (可能通过重置操作或选择了无效文件)。将尝试恢复页面上的原始头像。');
					revertCustomAvatarOnPage();
				}
				break;
			case 'enableLogging':
				// 日志设置本身的变化会立即影响后续的 log() 函数行为，无需额外调用。
				// 但可以输出一条明确的提示。
				if (value) {
					log(FN, '日志输出功能现已开启。此条及后续符合条件的日志将被记录。');
				} else {
					// 当日志关闭时，这是最后一条由脚本log函数输出的消息。
					console.log(`[${CONFIG.SCRIPT_NAME} v${CONFIG.SCRIPT_VERSION}] ${new Date().toLocaleString()}: ${FN}: 日志输出功能现已关闭。`);
				}
				break;
			default:
				log(FN, `  键 "${key}" 未匹配到需要特殊处理的功能模块，或其处理逻辑已包含在其他地方。`);
				break;
		}
		log(FN, `函数执行完毕 - 键: "${key}"。`);
	}

	// ===================================================================================
	// === 功能模块: 自定义头像 (Custom Avatar) ===
	// ===================================================================================
	/**
	 * @description 根据 currentSettings 中自定义头像的设置，初始化页面上的头像显示。
	 * 如果设置了自定义头像，则应用它；否则，尝试恢复（或确保为）页面的默认头像。
	 */
	function initializeCustomAvatarState() {
		const FN = 'initializeCustomAvatarState';
		log(FN, '函数开始执行。根据当前设置初始化自定义头像的显示状态。');
		if (currentSettings.customAvatar && currentSettings.customAvatar.dataUrl) {
			log(FN, '  检测到 currentSettings 中已存在有效的自定义头像数据。将调用 applyCustomAvatarToPage 尝试应用。');
			applyCustomAvatarToPage();
		} else {
			log(FN, '  currentSettings 中未设置自定义头像，或头像数据无效 (缺少dataUrl)。将调用 revertCustomAvatarOnPage 清理可能存在的自定义头像状态。');
			revertCustomAvatarOnPage();
		}
		log(FN, '函数执行完毕。');
	}

	/**
	 * @description 使用配置的选择器查找页面上用于显示用户头像的 <img> 元素。
	 * @returns {HTMLImageElement|null} 找到的<img>元素；如果未找到，则返回null。
	 */
	function findTargetAvatarImageElement() {
		const FN = 'findTargetAvatarImageElement';
		// log(FN, '尝试查找目标头像IMG元素。选择器:', CONFIG.SELECTORS.CUSTOM_AVATAR_IMAGE); // 此日志在频繁调用时可能过于冗余
		const element = document.querySelector(CONFIG.SELECTORS.CUSTOM_AVATAR_IMAGE);
		// if(element) { log(FN, '  成功找到目标头像IMG元素:', element); } else { log(FN, '  未找到目标头像IMG元素。'); }
		return element;
	}

	/**
	 * @description 将 currentSettings 中存储的自定义头像（Base64 DataURL）应用到页面上找到的头像<img>元素。
	 * 如果目标元素当前未找到，则会启动一个MutationObserver来等待其出现。
	 * 此函数包含防止重复应用的逻辑。
	 */
	function applyCustomAvatarToPage() {
		const FN = 'applyCustomAvatarToPage';
		log(FN, '函数开始执行，尝试应用自定义头像。');

		if (!currentSettings.customAvatar || !currentSettings.customAvatar.dataUrl) {
			log(FN, '  当前配置中未设置有效的自定义头像 (currentSettings.customAvatar.dataUrl 为空)。取消应用操作，并确保恢复原始头像状态。');
			revertCustomAvatarOnPage(); // 确保如果之前有自定义头像，现在被清除了，则恢复原始状态
			// 如果没有有效头像数据，也应该停止相关的观察器（revertCustomAvatarOnPage会处理）
			return;
		}

		log(FN, '  检测到有效的自定义头像数据，准备查找目标IMG元素并应用。DataURL 长度:', currentSettings.customAvatar.dataUrl.length);
		const targetImg = findTargetAvatarImageElement();

		if (targetImg) {
			log(FN, '  成功找到目标头像IMG元素:', targetImg);

			// 检查头像是否已被本脚本应用且SRC与当前设置一致，避免不必要的DOM操作和潜在的闪烁
			if (targetImg.getAttribute(CONFIG.CUSTOM_AVATAR_ATTRIBUTES.APPLIED) === 'true' &&
				targetImg.src === currentSettings.customAvatar.dataUrl) {
				log(FN, '  检测到此IMG元素已被正确应用了当前设置的自定义头像，无需重复修改。');
				// 如果是通过观察器找到并且确认无需操作，可以停止该观察器实例
				if (customAvatarObserver) {
					log(FN, '  自定义头像已正确应用。此 customAvatarObserver 实例的任务已完成，将停止并断开它。');
					customAvatarObserver.disconnect();
					customAvatarObserver = null;
				}
				return; // 无需进一步操作
			}

			log(FN, '  准备将自定义头像应用到目标IMG元素 (之前未应用，或SRC不匹配)。');
			// 注意：根据新需求，不再保存原始SRC。
			// targetImg.setAttribute(CONFIG.CUSTOM_AVATAR_ATTRIBUTES.FALLBACK_SRC, targetImg.src); // 已移除

			targetImg.src = currentSettings.customAvatar.dataUrl;
			log(FN, '    目标IMG元素的 src 属性已成功更新为自定义头像的 DataURL。');
			targetImg.removeAttribute('srcset'); // 移除 srcset 属性，它可能覆盖通过 src 设置的图像
			log(FN, '    目标IMG元素的 srcset 属性 (如果存在) 已被移除，以确保自定义头像正确显示。');
			targetImg.setAttribute(CONFIG.CUSTOM_AVATAR_ATTRIBUTES.APPLIED, 'true');
			log(FN, `    目标IMG元素已添加标记属性 "${CONFIG.CUSTOM_AVATAR_ATTRIBUTES.APPLIED}=true"。`);

			// 自定义头像成功应用后，此 specific 观察器实例的任务完成。
			if (customAvatarObserver) {
				log(FN, '  自定义头像已成功应用。将停止并断开当前的 customAvatarObserver 实例。');
				customAvatarObserver.disconnect();
				customAvatarObserver = null;
			}
		} else {
			log(FN, '  当前DOM中未找到目标头像IMG元素。');
			// 仅在未找到元素、功能已启用（有头像数据）、且观察器未运行时，才启动观察器
			if (!customAvatarObserver && currentSettings.customAvatar && currentSettings.customAvatar.dataUrl) {
				log(FN, '  当前没有活动的 customAvatarObserver，且已设置自定义头像。将创建并启动一个新的 MutationObserver 等待目标IMG元素出现。');
				customAvatarObserver = new MutationObserver((mutationsList, obs) => {
					log(FN, 'customAvatarObserver: MutationObserver 回调被触发。');
					// 在回调中再次检查头像数据是否仍然有效，以防在等待期间被重置
					if (!currentSettings.customAvatar || !currentSettings.customAvatar.dataUrl) {
						log(FN, '  customAvatarObserver 回调：但此时已无有效的自定义头像数据。将停止此观察器。');
						obs.disconnect(); // 停止观察
						customAvatarObserver = null; // 清除引用
						return;
					}
					const newlyFoundImg = findTargetAvatarImageElement();
					if (newlyFoundImg) {
						log(FN, '  customAvatarObserver 回调：成功检测到目标头像IMG元素已出现在DOM中！将调用 applyCustomAvatarToPage 进行处理。');
						// 注意：这里不需要手动停止观察器 obs，因为 applyCustomAvatarToPage 内部的逻辑
						// 在成功应用头像后，会把全局的 customAvatarObserver 置为 null 并断开。
						applyCustomAvatarToPage();
					} else {
						// log(FN, '  customAvatarObserver 回调：DOM发生变化，但仍未找到目标头像IMG元素。继续观察...'); // 此日志可能过于频繁
					}
				});
				try {
					customAvatarObserver.observe(document.documentElement, {
						childList: true,
						subtree: true
					});
					log(FN, '  customAvatarObserver 已成功启动，正在监视整个文档的DOM变化。');
				} catch (e) {
					log(FN, '  严重错误: customAvatarObserver 启动失败:', e);
					customAvatarObserver = null; // 确保启动失败时清除引用
				}
			} else if (customAvatarObserver && currentSettings.customAvatar && currentSettings.customAvatar.dataUrl) {
				log(FN, '  customAvatarObserver 已在运行中，将继续等待目标头像IMG元素出现。');
			} else if (!currentSettings.customAvatar || !currentSettings.customAvatar.dataUrl) {
				log(FN, '  未设置自定义头像数据，不启动 customAvatarObserver。');
				if (customAvatarObserver) { // 如果因为某种原因观察器还在但头像数据没了，也停掉
					customAvatarObserver.disconnect();
					customAvatarObserver = null;
				}
			}
		}
		log(FN, '函数执行完毕。');
	}

	/**
	 * @description 当自定义头像被重置（清除）时，调用此函数。
	 * 它会找到可能已被修改的头像<img>元素，并移除脚本添加的自定义属性。
	 * 网页应自行负责恢复显示其原始或默认头像。
	 * 同时停止相关的MutationObserver。
	 */
	function revertCustomAvatarOnPage() {
		const FN = 'revertCustomAvatarOnPage';
		log(FN, '函数开始执行，尝试移除自定义头像状态并让页面恢复其默认头像。');
		const targetImg = findTargetAvatarImageElement();

		if (targetImg) {
			log(FN, '  找到可能曾被修改的头像IMG元素:', targetImg);
			// 检查是否存在脚本添加的标记属性
			if (targetImg.hasAttribute(CONFIG.CUSTOM_AVATAR_ATTRIBUTES.APPLIED)) {
				log(FN, '  检测到此IMG元素曾被自定义头像功能修改过。准备移除自定义状态标记。');
				targetImg.removeAttribute(CONFIG.CUSTOM_AVATAR_ATTRIBUTES.APPLIED);
				// 不再需要恢复 CONFIG.CUSTOM_AVATAR_ATTRIBUTES.FALLBACK_SRC，因为已不保存
				// targetImg.src = ''; // 可选: 清空src强制浏览器重新加载原始src，但通常移除标记就够了，让页面自己处理
				log(FN, `    自定义头像标记属性 ("${CONFIG.CUSTOM_AVATAR_ATTRIBUTES.APPLIED}") 已从目标IMG元素上移除。`);
			} else {
				log(FN, '  目标IMG元素未被标记为已应用自定义头像，无需执行移除标记操作。');
			}
		} else {
			log(FN, '  未在当前DOM中找到目标头像IMG元素，无法执行恢复操作。');
		}

		// 无论是否找到IMG元素，如果自定义头像功能被禁用或重置，都应停止观察器
		if (customAvatarObserver) {
			log(FN, '  由于正在恢复/清除自定义头像状态，将停止并清除 customAvatarObserver。');
			customAvatarObserver.disconnect();
			customAvatarObserver = null;
		}
		log(FN, '函数执行完毕。');
	}


	// --- 功能模块: 优化界面 (Optimize UI) ---
	function toggleOptimizeUIFeature(enable) {
		const FN = 'toggleOptimizeUIFeature';
		log(FN, `请求设置“优化界面”功能为: ${enable}`);
		isOptimizeUIFeatureActive = enable;
		if (isOptimizeUIFeatureActive) {
			log(FN, '  “优化界面”功能已激活。调用 manageOptimizeUITarget 处理目标元素。');
			manageOptimizeUITarget();
		} else {
			log(FN, '  “优化界面”功能已禁用。');
			if (optimizeUITargetObserver) {
				log(FN, '    停止活动的 optimizeUITargetObserver。');
				optimizeUITargetObserver.disconnect();
				optimizeUITargetObserver = null;
			}
			const placeholder = document.getElementById(CONFIG.ELEMENT_IDS.OPTIMIZE_UI_PLACEHOLDER);
			if (placeholder) {
				log(FN, '    找到并移除“优化界面”的占位符 (ID:', CONFIG.ELEMENT_IDS.OPTIMIZE_UI_PLACEHOLDER, ')。');
				placeholder.remove();
			} else {
				log(FN, '    未找到需要移除的“优化界面”占位符。');
			}
		}
		log(FN, `执行完毕。当前状态 (isOptimizeUIFeatureActive): ${isOptimizeUIFeatureActive}`);
	}

	function manageOptimizeUITarget() {
		const FN = 'manageOptimizeUITarget';
		log(FN, '开始管理“优化界面”目标元素。');
		if (!isOptimizeUIFeatureActive) {
			log(FN, '  功能未激活，取消操作。');
			if (optimizeUITargetObserver) {
				optimizeUITargetObserver.disconnect();
				optimizeUITargetObserver = null;
			}
			return;
		}
		const targetElement = document.querySelector(CONFIG.SELECTORS.OPTIMIZE_UI_TARGET_ELEMENT);
		if (targetElement) {
			log(FN, '  找到“优化界面”目标元素:', targetElement);
			const parent = targetElement.parentNode;
			if (!parent) {
				log(FN, '  错误: 目标元素无父节点!');
				return;
			}

			let placeholder = document.getElementById(CONFIG.ELEMENT_IDS.OPTIMIZE_UI_PLACEHOLDER);
			if (placeholder && placeholder.parentNode !== parent) {
				placeholder = null;
			}

			if (!placeholder) {
				log(FN, '  未找到有效占位符，创建并插入1rem高占位符。');
				placeholder = document.createElement('div');
				placeholder.id = CONFIG.ELEMENT_IDS.OPTIMIZE_UI_PLACEHOLDER;
				placeholder.style.height = '1rem';
				placeholder.style.width = '100%';
				placeholder.setAttribute('data-comment', `${CONFIG.SCRIPT_NAME} 创建的优化界面占位符`);
				parent.insertBefore(placeholder, targetElement);
				log(FN, '  占位符已插入目标元素之前。');
			} else {
				log(FN, '  已存在有效占位符。');
			}
			try {
				targetElement.remove();
				log(FN, '  目标“优化界面”元素已移除。');
			} catch (e) {
				log(FN, '  移除目标“优化界面”元素时出错:', e);
			}
		} else {
			log(FN, '  未找到“优化界面”目标元素。');
			const existingPlaceholder = document.getElementById(CONFIG.ELEMENT_IDS.OPTIMIZE_UI_PLACEHOLDER);
			if (existingPlaceholder) {
				log(FN, '  目标元素未找到，但占位符已存在。无需操作。');
				return;
			}
			if (!optimizeUITargetObserver && isOptimizeUIFeatureActive) {
				log(FN, '  启动 optimizeUITargetObserver 等待目标元素出现...');
				optimizeUITargetObserver = new MutationObserver(() => {
					if (!isOptimizeUIFeatureActive) {
						if (optimizeUITargetObserver) {
							optimizeUITargetObserver.disconnect();
							optimizeUITargetObserver = null;
						}
						return;
					}
					if (document.querySelector(CONFIG.SELECTORS.OPTIMIZE_UI_TARGET_ELEMENT)) {
						log(FN, '  optimizeUITargetObserver: 目标元素已出现!');
						manageOptimizeUITarget();
					}
				});
				try {
					optimizeUITargetObserver.observe(document.documentElement, {
						childList: true,
						subtree: true
					});
				} catch (e) {
					log(FN, '  错误: optimizeUITargetObserver 启动失败:', e);
					optimizeUITargetObserver = null;
				}
			}
		}
		log(FN, '执行完毕。');
	}

	// --- 功能模块: 隐藏滚动至末尾按钮 ---
	function toggleHideScrollToEndButtonFeature(enable) {
		const FN = 'toggleHideScrollToEndButtonFeature';
		log(FN, `请求设置“隐藏滚动至末尾按钮”功能为: ${enable}`);
		isHideScrollToEndButtonFeatureActive = enable;
		if (isHideScrollToEndButtonFeatureActive) {
			log(FN, '  功能已激活，调用 manageScrollToEndButtonVisibility。');
			manageScrollToEndButtonVisibility();
		} else {
			log(FN, '  功能已禁用。如果观察器在运行，则停止。');
			if (scrollToEndButtonObserver) {
				scrollToEndButtonObserver.disconnect();
				scrollToEndButtonObserver = null;
				log(FN, '    scrollToEndButtonObserver 已停止。');
			}
		}
		log(FN, `执行完毕。状态: ${isHideScrollToEndButtonFeatureActive}`);
	}

	function manageScrollToEndButtonVisibility() {
		const FN = 'manageScrollToEndButtonVisibility';
		log(FN, '开始管理“滚动至末尾按钮”。');
		if (!isHideScrollToEndButtonFeatureActive) {
			if (scrollToEndButtonObserver) {
				scrollToEndButtonObserver.disconnect();
				scrollToEndButtonObserver = null;
			}
			return;
		}
		const btn = document.querySelector(CONFIG.SELECTORS.SCROLL_TO_END_BUTTON);
		if (btn) {
			log(FN, '  找到“滚动至末尾按钮”，准备移除:', btn);
			try {
				btn.remove();
				log(FN, '  “滚动至末尾按钮”已移除。');
			} catch (error) {
				log(FN, '  移除“滚动至末尾按钮”时出错:', error);
			}
		} else {
			log(FN, '  未找到“滚动至末尾按钮”。');
			if (!scrollToEndButtonObserver && isHideScrollToEndButtonFeatureActive) {
				log(FN, '  启动 scrollToEndButtonObserver 等待按钮出现...');
				scrollToEndButtonObserver = new MutationObserver(() => {
					if (!isHideScrollToEndButtonFeatureActive) {
						if (scrollToEndButtonObserver) {
							scrollToEndButtonObserver.disconnect();
							scrollToEndButtonObserver = null;
						}
						return;
					}
					if (document.querySelector(CONFIG.SELECTORS.SCROLL_TO_END_BUTTON)) {
						log(FN, '  scrollToEndButtonObserver: 按钮已出现!');
						manageScrollToEndButtonVisibility();
					}
				});
				try {
					scrollToEndButtonObserver.observe(document.documentElement, {
						childList: true,
						subtree: true
					});
				} catch (e) {
					log(FN, '  错误: scrollToEndButtonObserver 启动失败:', e);
					scrollToEndButtonObserver = null;
				}
			}
		}
		log(FN, '执行完毕。');
	}

	// --- 功能模块: 隐藏侧边工具栏入口 ---
	function toggleHideSidebarEntryFeature(enable) {
		const FN = 'toggleHideSidebarEntryFeature';
		log(FN, `请求设置“隐藏侧边工具栏入口”功能为: ${enable}`);
		isHideSidebarEntryFeatureActive = enable;
		if (isHideSidebarEntryFeatureActive) {
			log(FN, '  功能已激活，调用 manageToggleButtonVisibility。');
			manageToggleButtonVisibility();
		} else {
			log(FN, '  功能已禁用。如果观察器在运行，则停止。');
			if (toggleButtonObserver) {
				toggleButtonObserver.disconnect();
				toggleButtonObserver = null;
				log(FN, '    toggleButtonObserver 已停止。');
			}
		}
		log(FN, `执行完毕。状态: ${isHideSidebarEntryFeatureActive}`);
	}

	function manageToggleButtonVisibility() {
		const FN = 'manageToggleButtonVisibility';
		log(FN, '开始管理“侧边工具栏入口按钮”。');
		if (!isHideSidebarEntryFeatureActive) {
			if (toggleButtonObserver) {
				toggleButtonObserver.disconnect();
				toggleButtonObserver = null;
			}
			return;
		}
		const btn = document.querySelector(CONFIG.SELECTORS.SIDEBAR_TOGGLE_BUTTON);
		if (btn) {
			log(FN, '  找到“侧边工具栏入口按钮” (#toggleButton)，准备移除:', btn);
			try {
				btn.remove();
				log(FN, '  “侧边工具栏入口按钮” (#toggleButton) 已移除。');
			} catch (error) {
				log(FN, '  移除“侧边工具栏入口按钮” (#toggleButton) 时出错:', error);
			}
		} else {
			log(FN, '  未找到“侧边工具栏入口按钮” (#toggleButton)。');
			if (!toggleButtonObserver && isHideSidebarEntryFeatureActive) {
				log(FN, '  启动 toggleButtonObserver 等待按钮出现...');
				toggleButtonObserver = new MutationObserver(() => {
					if (!isHideSidebarEntryFeatureActive) {
						if (toggleButtonObserver) {
							toggleButtonObserver.disconnect();
							toggleButtonObserver = null;
						}
						return;
					}
					if (document.querySelector(CONFIG.SELECTORS.SIDEBAR_TOGGLE_BUTTON)) {
						log(FN, '  toggleButtonObserver: 按钮已出现!');
						manageToggleButtonVisibility();
					}
				});
				try {
					toggleButtonObserver.observe(document.documentElement, {
						childList: true,
						subtree: true
					});
				} catch (e) {
					log(FN, '  错误: toggleButtonObserver 启动失败:', e);
					toggleButtonObserver = null;
				}
			}
		}
		log(FN, '执行完毕。');
	}

	// --- 功能模块: 积分显示 ---
	async function togglePointsDisplayFeature(enable) {
		const FN = 'togglePointsDisplayFeature';
		log(FN, `请求设置“积分显示”功能为: ${enable}`);
		isPointsDisplayFeatureActive = enable;
		if (enable) {
			log(FN, '  “积分显示”功能已激活。');
			await loadSavedQuotaData();
			updateQuotaPanelUI(lastQuotaData);
			attemptQuotaPanelInsertion();
			fetchQuotaData('功能启用');
			startAutoRefreshTimer();
		} else {
			log(FN, '  “积分显示”功能已禁用。');
			removeQuotaPanel();
			stopAutoRefreshTimer();
		}
		log(FN, `执行完毕。状态: ${isPointsDisplayFeatureActive}`);
	}

	function getPointsTargetElement() {
		return document.querySelector(CONFIG.SELECTORS.POINTS_PANEL_TARGET_CONTAINER);
	}

	function createQuotaPanelHTML() {
		log('createQuotaPanelHTML: 生成积分面板HTML。');
		return `
			<div
				id="${CONFIG.ELEMENT_IDS.QUOTA_PANEL_CONTAINER}"
				style="position:sticky;
				bottom:0;
				left:0;
				width:100%;
				font-size:.68rem;
				text-align:left;
				border-top:1px solid #dcdcdc;
				padding:.4rem .4rem .4rem 0;
				box-sizing:border-box;
				background:#f9f9f9"
				>
				<div
					class="quota-panel-interactive"
					style="padding:.4rem;
					transition:background .2s, border-radius .2s"
					onmouseover="this.style.background='#efefef'; this.style.borderRadius='10px'"
					onmouseout="this.style.background=''; this.style.borderRadius=''"
					onmousedown="this.style.background='#eaeaea'"
					onmouseup="this.style.background='#efefef'"
					>
					<div style="margin-bottom:.1rem">
						<span style="font-weight:600">通用积分：</span>
						<span
							class="quota-general-value"
							style="font-weight:600"
							>
						${CONFIG.POINTS_PANEL_DEFAULTS.USED_FALLBACK}/${CONFIG.POINTS_PANEL_DEFAULTS.MAX_QUOTA_FALLBACK}
						</span>
					</div>
					<div style="margin-bottom:.2rem">
						<span>重置时间：</span>
						<span class="quota-general-reset-value">
						${CONFIG.POINTS_PANEL_DEFAULTS.TIME_STRING}
						</span>
					</div>
					<div style="margin-bottom:.1rem">
						<span style="font-weight:600">高级积分：</span>
						<span
							class="quota-premium-value"
							style="font-weight:600"
							>
						${CONFIG.POINTS_PANEL_DEFAULTS.USED_FALLBACK}/${CONFIG.POINTS_PANEL_DEFAULTS.MAX_QUOTA_FALLBACK}
						</span>
					</div>
					<div>
						<span>重置时间：</span>
						<span class="quota-premium-reset-value">
						${CONFIG.POINTS_PANEL_DEFAULTS.TIME_STRING}
						</span>
					</div>
				</div>
			</div>
		`;
	}

	function attemptQuotaPanelInsertion() {
		const FN = 'attemptQuotaPanelInsertion';
		log(FN, '开始尝试注入积分面板。');
		if (!isPointsDisplayFeatureActive) {
			if (pointsPanelTargetObserver) {
				pointsPanelTargetObserver.disconnect();
				pointsPanelTargetObserver = null;
			}
			log(FN, '  功能未激活，取消注入。');
			return;
		}
		const targetElement = getPointsTargetElement();
		if (targetElement) {
			log(FN, '  找到积分面板注入目标。');
			if (pointsPanelTargetObserver) {
				pointsPanelTargetObserver.disconnect();
				pointsPanelTargetObserver = null;
				log(FN, '    已停止积分面板目标观察器。');
			}
			if (!document.getElementById(CONFIG.ELEMENT_IDS.QUOTA_PANEL_CONTAINER)) {
				log(FN, '  积分面板不在DOM中，执行注入。');
				targetElement.insertAdjacentHTML('beforeend', createQuotaPanelHTML());
				const interactiveElement = targetElement.querySelector(`#${CONFIG.ELEMENT_IDS.QUOTA_PANEL_CONTAINER} .quota-panel-interactive`);
				if (interactiveElement) {
					interactiveElement.addEventListener('click', (event) => {
						if (event.button === 0) {
							log(FN, '  积分面板被左键点击。');
							fetchQuotaData('手动点击面板');
						}
					});
					log(FN, '  已为积分面板交互区域添加点击监听。');
				}
			} else {
				log(FN, '  积分面板已存在于DOM中。');
			}
			updateQuotaPanelUI(lastQuotaData);
		} else {
			log(FN, '  未找到积分面板注入目标。');
			if (!pointsPanelTargetObserver && isPointsDisplayFeatureActive) {
				log(FN, '  启动积分面板目标观察器...');
				pointsPanelTargetObserver = new MutationObserver(() => {
					if (getPointsTargetElement()) {
						log(FN, '  积分面板观察器：目标出现!');
						attemptQuotaPanelInsertion();
					}
				});
				try {
					pointsPanelTargetObserver.observe(document.documentElement, {
						childList: true,
						subtree: true
					});
				} catch (e) {
					log(FN, '  错误 (积分面板观察器启动):', e);
					pointsPanelTargetObserver = null;
				}
			}
		}
		log(FN, '执行完毕。');
	}

	function removeQuotaPanel() {
		const el = document.getElementById(CONFIG.ELEMENT_IDS.QUOTA_PANEL_CONTAINER);
		if (el) el.remove();
		log('removeQuotaPanel: 积分面板已移除（如果存在）。');
	}
	async function loadSavedQuotaData() {
		const FN = 'loadSavedQuotaData';
		log(FN, '开始加载本地积分数据。');
		try {
			const d = await GM_getValue(CONFIG.STORAGE_KEYS.QUOTA_DATA, null);
			if (d && typeof d === 'object') {
				lastQuotaData = d;
				log(FN, '  成功加载:', d);
			} else {
				lastQuotaData = null;
				log(FN, '  无有效本地数据。');
			}
		} catch (e) {
			lastQuotaData = null;
			log(FN, '  加载错误:', e);
		}
		log(FN, '执行完毕。');
	}
	async function saveQuotaData(data) {
		const FN = 'saveQuotaData';
		log(FN, '准备保存积分数据:', data);
		if (!data || typeof data !== 'object') {
			log(FN, '  数据无效，取消保存。');
			return;
		}
		lastQuotaData = data;
		try {
			await GM_setValue(CONFIG.STORAGE_KEYS.QUOTA_DATA, data);
			log(FN, '  积分数据已保存至本地。');
		} catch (e) {
			log(FN, '  保存积分数据错误:', e);
		}
		log(FN, '执行完毕。');
	}

	function updateQuotaPanelUI(sourceData = null) {
		const FN = 'updateQuotaPanelUI';
		log(FN, '开始更新积分面板UI。提供的数据:', sourceData);
		const panelElement = document.getElementById(CONFIG.ELEMENT_IDS.QUOTA_PANEL_CONTAINER);
		if (!panelElement) {
			log(FN, '  错误: 积分面板未在DOM中找到，无法更新。');
			return;
		}

		const NONE = CONFIG.POINTS_PANEL_DEFAULTS.NONE_PLACEHOLDER;
		const DEFAULT_TIME_STR = CONFIG.POINTS_PANEL_DEFAULTS.TIME_STRING;
		const DEFAULT_MAX = CONFIG.POINTS_PANEL_DEFAULTS.MAX_QUOTA_FALLBACK;
		const DEFAULT_USED = CONFIG.POINTS_PANEL_DEFAULTS.USED_FALLBACK;

		const getValue = (valueFromData) => (valueFromData !== undefined && valueFromData !== null) ? valueFromData : NONE;
		const formatTimestamp = (timestamp) => {
			if (timestamp === NONE) return NONE; // 直接传递 "None"
			if (typeof timestamp !== 'number' || timestamp <= 0) {
				log(FN, `  时间戳无效或非正数 ("${timestamp}")，将显示为 "${NONE}"。`);
				return NONE; // 对于无效的数字时间戳，也显示 "None"
			}
			try {
				return new Date(timestamp).toLocaleString();
			} catch (e) {
				log(FN, `  错误: 格式化时间戳 ${timestamp} 失败:`, e, `将显示为 "${NONE}"。`);
				return NONE;
			}
		};

		if (sourceData && typeof sourceData === 'object') {
			log(FN, '  使用 sourceData 更新UI:', sourceData);
			const uG = getValue(sourceData.usedQuota);
			const mG = getValue(sourceData.maxQuota);
			panelElement.querySelector('.quota-general-value').textContent = `${uG === NONE ? DEFAULT_USED : uG}/${mG === NONE ? DEFAULT_MAX : mG}`;
			panelElement.querySelector('.quota-general-reset-value').textContent = formatTimestamp(getValue(sourceData.resetTime));

			const uP = getValue(sourceData.usedProquota);
			const mP = getValue(sourceData.maxProQuota);
			panelElement.querySelector('.quota-premium-value').textContent = `${uP === NONE ? DEFAULT_USED : uP}/${mP === NONE ? DEFAULT_MAX : mP}`;
			panelElement.querySelector('.quota-premium-reset-value').textContent = formatTimestamp(getValue(sourceData.proResetTime));
			log(FN, `    通用积分UI: ${panelElement.querySelector('.quota-general-value').textContent}, 重置: ${panelElement.querySelector('.quota-general-reset-value').textContent}`);
			log(FN, `    高级积分UI: ${panelElement.querySelector('.quota-premium-value').textContent}, 重置: ${panelElement.querySelector('.quota-premium-reset-value').textContent}`);
		} else {
			log(FN, '  无有效 sourceData (可能 lastQuotaData 为空 或 API调用均失败)。将使用硬编码的最终回退默认值。');
			panelElement.querySelector('.quota-general-value').textContent = `${DEFAULT_USED}/${DEFAULT_MAX}`;
			panelElement.querySelector('.quota-general-reset-value').textContent = DEFAULT_TIME_STR;
			panelElement.querySelector('.quota-premium-value').textContent = `${DEFAULT_USED}/${DEFAULT_MAX}`;
			panelElement.querySelector('.quota-premium-reset-value').textContent = DEFAULT_TIME_STR;
			log(FN, '    面板已用最终回退默认值填充。');
		}
		log(FN, 'UI更新完毕。');
	}
	async function fetchQuotaData(triggerReason = "未知原因") {
		const FN = 'fetchQuotaData';
		log(FN, `开始获取积分数据。触发原因: "${triggerReason}"`);
		if (!isPointsDisplayFeatureActive) {
			log(FN, '  积分功能未激活，取消API请求。');
			return;
		}
		if (isQuotaRequestPending) {
			log(FN, `  API请求进行中，本次由 "${triggerReason}" 触发的请求被跳过。`);
			return;
		}
		isQuotaRequestPending = true;
		log(FN, `  API请求锁已设置。URL: ${CONFIG.API.QUOTA_URL}`);
		resetAutoRefreshTimer(`API请求 (${triggerReason})`);
		GM_xmlhttpRequest({
			method: "GET",
			url: CONFIG.API.QUOTA_URL,
			timeout: CONFIG.API.TIMEOUT_MS,
			onload: function (response) {
				log(FN, `  API请求成功 (onload)。HTTP状态: ${response.status}`);
				let parsedData = null;
				try {
					if (response.responseText) {
						parsedData = JSON.parse(response.responseText);
						log(FN, '  成功解析API响应JSON:', parsedData);
						if (parsedData && typeof parsedData === 'object') {
							saveQuotaData(parsedData);
							updateQuotaPanelUI(parsedData);
							log(FN, '  API数据已保存并更新UI。');
						} else {
							log(FN, '  错误: API响应JSON非有效对象。使用旧数据(lastQuotaData)更新UI。');
							updateQuotaPanelUI(lastQuotaData);
						}
					} else {
						log(FN, '  错误: API响应体为空。使用旧数据(lastQuotaData)更新UI。');
						updateQuotaPanelUI(lastQuotaData);
					}
				} catch (e) {
					log(FN, '  解析API响应JSON失败:', e, "响应文本:", response.responseText, "将使用旧数据(lastQuotaData)更新UI。");
					updateQuotaPanelUI(lastQuotaData);
				}
				isQuotaRequestPending = false;
				log(FN, '  API请求锁已释放 (onload)。');
			},
			onerror: function (r) {
				log(FN, `  API请求错误 (onerror)。状态:${r.status}`, r);
				updateQuotaPanelUI(lastQuotaData);
				isQuotaRequestPending = false;
				log(FN, '  API请求锁已释放 (onerror)。');
			},
			ontimeout: function () {
				log(FN, `  API请求超时 (${CONFIG.API.TIMEOUT_MS}ms)。`);
				updateQuotaPanelUI(lastQuotaData);
				isQuotaRequestPending = false;
				log(FN, '  API请求锁已释放 (ontimeout)。');
			},
			onabort: function () {
				log(FN, `  API请求中止。`);
				updateQuotaPanelUI(lastQuotaData);
				isQuotaRequestPending = false;
				log(FN, '  API请求锁已释放 (onabort)。');
			}
		});
		log(FN, '执行完毕（GM_xmlhttpRequest已异步发起）。');
	}

	function startAutoRefreshTimer() {
		const FN = 'startAutoRefreshTimer';
		log(FN, '尝试启动自动刷新计时器。');
		if (!isPointsDisplayFeatureActive || autoRefreshTimerId) {
			log(FN, `  条件不满足 (功能激活:${isPointsDisplayFeatureActive}, 计时器ID:${autoRefreshTimerId})，不启动。`);
			return;
		}
		autoRefreshCountdown = CONFIG.API.QUOTA_AUTO_REFRESH_INTERVAL_S;
		log(FN, `  自动刷新倒计时设为 ${autoRefreshCountdown}s。`);
		autoRefreshTimerId = setInterval(() => {
			if (!isPointsDisplayFeatureActive) {
				stopAutoRefreshTimer();
				return;
			}
			autoRefreshCountdown--;
			if ((autoRefreshCountdown % 10 === 0 && autoRefreshCountdown > 0) || (autoRefreshCountdown <= 5 && autoRefreshCountdown > 0)) log(FN, `  ${autoRefreshCountdown} 秒后自动请求API...`);
			if (autoRefreshCountdown <= 0) {
				log(FN, '  自动刷新倒计时结束，触发API请求。');
				fetchQuotaData(`${CONFIG.API.QUOTA_AUTO_REFRESH_INTERVAL_S}秒自动刷新`);
				autoRefreshCountdown = CONFIG.API.QUOTA_AUTO_REFRESH_INTERVAL_S;
				log(FN, '  倒计时已重置。');
			}
		}, 1000);
		log(FN, '  自动刷新计时器已启动 (setInterval ID:', autoRefreshTimerId, ')。');
	}

	function stopAutoRefreshTimer() {
		const FN = 'stopAutoRefreshTimer';
		log(FN, '尝试停止自动刷新计时器。');
		if (autoRefreshTimerId) {
			clearInterval(autoRefreshTimerId);
			log(FN, '  已清除计时器 (ID:', autoRefreshTimerId, ')。');
			autoRefreshTimerId = null;
			autoRefreshCountdown = CONFIG.API.QUOTA_AUTO_REFRESH_INTERVAL_S;
			log(FN, '  计时器ID置空，倒计时重置。');
		} else {
			log(FN, '  无活动计时器。');
		}
	}

	function resetAutoRefreshTimer(reason) {
		const FN = 'resetAutoRefreshTimer';
		log(FN, `因 "${reason}" 请求重置自动刷新计时器。`);
		if (!isPointsDisplayFeatureActive) {
			log(FN, '  积分功能未激活，不重置。');
			return;
		}
		stopAutoRefreshTimer();
		startAutoRefreshTimer();
		log(FN, '  自动刷新计时器已重置并重启。');
	}

	// --- 主设置面板UI ---
	function createAdvancedSettingsButton() {
		const FN = 'createAdvancedSettingsButton';
		log(FN, '开始创建“高级设置”按钮。');
		const rB = document.querySelector(CONFIG.SELECTORS.ADVANCED_SETTINGS_BUTTON_STYLE_REFERENCE);
		const b = document.createElement('button');
		b.id = CONFIG.ELEMENT_IDS.ADVANCED_SETTINGS_BUTTON;
		b.textContent = CONFIG.TEXT.ADV_SETTINGS_BUTTON;
		if (!rB) {
			log(FN, '未找到样式参考按钮，用默认class。');
			b.className = 'btn btn-secondary text-token-text-primary relative';
		} else {
			log(FN, '找到参考按钮，复制class。');
			b.className = rB.className;
		}
		b.classList.add('btn', 'btn-secondary', 'text-token-text-primary', 'relative');
		b.removeAttribute('aria-label');
		b.addEventListener('click', () => {
			log(FN, `“高级设置”按钮(ID:${b.id})被点击。`);
			toggleMainSettingsPanel();
		});
		log(FN, '创建完毕。');
		return b;
	}

	function createMainSettingsPanel() {
		const FN = 'createMainSettingsPanel';
		log(FN, '开始创建主设置面板。');
		const p = document.createElement('div');
		p.id = CONFIG.ELEMENT_IDS.SETTINGS_PANEL;
		Object.assign(p.style, {
			display: 'none',
			flexDirection: 'column',
			position: 'fixed',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%,-50%)',
			width: '480px',
			maxWidth: '95%',
			maxHeight: '85vh',
			backgroundColor: '#f9f9f9',
			color: '#333',
			padding: '25px',
			borderRadius: '10px',
			boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
			zIndex: '2147483647',
			fontFamily: 'system-ui,sans-serif'
		});
		const t = document.createElement('h2');
		t.textContent = CONFIG.TEXT.SETTINGS_PANEL_TITLE;
		Object.assign(t.style, {
			textAlign: 'center',
			marginTop: '0',
			marginBottom: '20px',
			fontSize: '1.3rem',
			color: '#000',
			fontWeight: '600',
			flexShrink: '0'
		});
		p.appendChild(t);
		const sA = document.createElement('div');
		sA.id = CONFIG.ELEMENT_IDS.SCROLLABLE_CONTENT_AREA;
		Object.assign(sA.style, {
			flexGrow: '1',
			overflowY: 'auto',
			minHeight: '0',
			paddingRight: '15px'
		});
		p.appendChild(sA);
		const sC = document.createElement('div');
		sC.id = 'aizex-enhancer-main-settings-items-container';
		Object.assign(sC.style, {
			display: 'flex',
			flexDirection: 'column'
		});
		sA.appendChild(sC);
		const iCfgs = [{
			id: 'showPoints',
			t: CONFIG.TEXT.SETTING_ITEM_TITLES.showPoints
		}, {
			id: 'hideSidebarEntry',
			t: CONFIG.TEXT.SETTING_ITEM_TITLES.hideSidebarEntry
		}, {
			id: 'hideScrollToEnd',
			t: CONFIG.TEXT.SETTING_ITEM_TITLES.hideScrollToEnd
		}, {
			id: 'optimizeUI',
			t: CONFIG.TEXT.SETTING_ITEM_TITLES.optimizeUI
		}, {
			id: 'enableLogging',
			t: CONFIG.TEXT.SETTING_ITEM_TITLES.enableLogging
		}, {
			id: 'customAvatar',
			t: CONFIG.TEXT.SETTING_ITEM_TITLES.customAvatar,
			type: 'file_custom'
		}].map(c => ({
			...c,
			type: c.type || 'toggle'
		}));
		iCfgs.forEach(i => sC.appendChild(createMainSettingItem(i.id, i.t, i.type)));
		const cB = document.createElement('button');
		cB.textContent = CONFIG.TEXT.CLOSE_PANEL_BUTTON;
		Object.assign(cB.style, {
			marginTop: '20px',
			padding: '12px 20px',
			width: '100%',
			border: 'none',
			borderRadius: '6px',
			backgroundColor: '#007bff',
			color: 'white',
			cursor: 'pointer',
			fontSize: '1rem',
			transition: 'background-color .2s ease',
			flexShrink: '0'
		});
		cB.addEventListener('click', () => closeMainSettingsPanel());
		p.appendChild(cB);
		if (document.body) document.body.appendChild(p);
		else log(FN, '错误:body未找到');
		log(FN, '创建完毕.');
		return p;
	}

	function createMainSettingItem(id, titleText, type) {
		const FN = 'createMainSettingItem';
		log(FN, `为ID "${id}" 创建类型 "${type}" 设置项, 标题:"${titleText}"`);
		const iW = document.createElement('div');
		const iD = document.createElement('div');
		Object.assign(iD.style, {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			padding: '15px 0',
			fontSize: '.875rem'
		});
		const tL = document.createElement('span');
		tL.textContent = titleText;
		Object.assign(tL.style, {
			flexGrow: '1',
			marginRight: '15px',
			color: '#222',
			userSelect: 'none'
		});
		iD.appendChild(tL);
		if (type === 'toggle') {
			const sw = document.createElement('label');
			sw.className = 'custom-toggle-switch';
			Object.assign(sw.style, {
				position: 'relative',
				display: 'inline-block',
				width: '50px',
				height: '26px',
				flexShrink: '0'
			});
			const cb = document.createElement('input');
			cb.type = 'checkbox';
			cb.checked = !!currentSettings[id];
			cb.id = `aizex-enhancer-chk-${id}`;
			Object.assign(cb.style, {
				opacity: '0',
				width: '0',
				height: '0'
			});
			const sl = document.createElement('span');
			sl.className = 'slider';
			Object.assign(sl.style, {
				position: 'absolute',
				cursor: 'pointer',
				top: '0',
				left: '0',
				right: '0',
				bottom: '0',
				backgroundColor: cb.checked ? '#000' : '#e3e3e3',
				transition: 'background-color .3s,transform .3s',
				borderRadius: '26px'
			});
			const kn = document.createElement('span');
			kn.className = 'knob';
			Object.assign(kn.style, {
				position: 'absolute',
				height: '20px',
				width: '20px',
				left: cb.checked ? '26px' : '4px',
				bottom: '3px',
				backgroundColor: 'white',
				transition: 'transform .3s ease-out,left .3s ease-out',
				borderRadius: '50%',
				boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
			});
			sl.appendChild(kn);
			cb.addEventListener('change', async function () {
				const nV = this.checked;
				log(FN, `设置项 "${titleText}" 开关变化为:${nV}`);
				await saveSetting(id, nV);
				sl.style.backgroundColor = nV ? '#000' : '#e3e3e3';
				kn.style.left = nV ? '26px' : '4px';
			});
			sw.appendChild(cb);
			sw.appendChild(sl);
			iD.appendChild(sw);
		} else if (type === 'file_custom' && id === 'customAvatar') {
			const bts = document.createElement('div');
			Object.assign(bts.style, {
				display: 'flex',
				alignItems: 'center',
				gap: '10px'
			});
			const fIn = document.createElement('input');
			fIn.type = 'file';
			fIn.accept = 'image/*';
			fIn.id = `aizex-enhancer-file-${id}`;
			fIn.style.display = 'none';
			const sBtn = document.createElement('button');
			sBtn.id = `aizex-enhancer-selbtn-${id}`;
			const avS = currentSettings[id];
			sBtn.textContent = (avS && avS.isSet && avS.dataUrl) ? CONFIG.TEXT.AVATAR_BTN_SELECTED : CONFIG.TEXT.AVATAR_BTN_SELECT;
			Object.assign(sBtn.style, {
				padding: '6px 12px',
				fontSize: '.8rem',
				cursor: 'pointer',
				border: '1px solid #ccc',
				borderRadius: '4px',
				backgroundColor: '#f0f0f0',
				lineHeight: '1.5'
			});
			sBtn.addEventListener('click', () => fIn.click());
			fIn.addEventListener('change', async function (e) {
				if (e.target.files && e.target.files[0]) {
					const f = e.target.files[0];
					log(FN, `自定义头像: 用户选择文件:${f.name},大小:${f.size},类型:${f.type}`);
					const r = new FileReader();
					r.onload = async function (ev) {
						const dU = ev.target.result;
						log(FN, `自定义头像:DataURL长度:${dU.length}`);
						if (dU.length > 5 * 1024 * 1024) {
							alert(`警告:头像文件过大(${(dU.length*0.75/1024/1024).toFixed(2)}MB)`);
							log(FN, `警告:自定义头像文件大小过大`);
						}
						await saveSetting(id, {
							isSet: true,
							originalName: f.name,
							dataUrl: dU
						});
						sBtn.textContent = CONFIG.TEXT.AVATAR_BTN_SELECTED;
					};
					r.onerror = () => {
						alert('读取头像文件失败');
						log(FN, 'FileReader错误');
					};
					r.readAsDataURL(f);
				}
			});
			const rBtn = document.createElement('button');
			rBtn.textContent = CONFIG.TEXT.AVATAR_BTN_RESET;
			Object.assign(rBtn.style, {
				padding: '6px 12px',
				fontSize: '.8rem',
				cursor: 'pointer',
				border: '1px solid #ccc',
				borderRadius: '4px',
				backgroundColor: '#f0f0f0',
				lineHeight: '1.5'
			});
			rBtn.addEventListener('click', async () => {
				log(FN, '自定义头像:重置点击');
				fIn.value = null;
				await saveSetting(id, null);
				sBtn.textContent = CONFIG.TEXT.AVATAR_BTN_SELECT;
			});
			bts.appendChild(sBtn);
			bts.appendChild(rBtn);
			iD.appendChild(bts);
			iD.appendChild(fIn);
		}
		iW.appendChild(iD);
		const sep = document.createElement('hr');
		Object.assign(sep.style, {
			border: 'none',
			borderTop: '1px solid #e7e7e7',
			margin: '0'
		});
		iW.appendChild(sep);
		return iW;
	}

	function openMainSettingsPanel() {
		const FN = 'openMainSettingsPanel';
		log(FN, '打开主面板');
		let p = document.getElementById(CONFIG.ELEMENT_IDS.SETTINGS_PANEL),
			o = document.getElementById(CONFIG.ELEMENT_IDS.OVERLAY);
		if (!p || !o) {
			log(FN, '面板或遮罩未找到，重建UI');
			initializeMainUIElements();
			p = document.getElementById(CONFIG.ELEMENT_IDS.SETTINGS_PANEL);
			o = document.getElementById(CONFIG.ELEMENT_IDS.OVERLAY);
			if (!p || !o) {
				log(FN, '重建失败，中止');
				return;
			}
		}
		if (p) p.style.display = 'flex';
		if (o) o.style.display = 'block';
		if (document.body) document.body.style.overflow = 'hidden';
		refreshMainSettingsPanelUI();
		log(FN, '主面板已显示');
	}

	function closeMainSettingsPanel() {
		const FN = 'closeMainSettingsPanel';
		log(FN, '关闭主面板');
		const p = document.getElementById(CONFIG.ELEMENT_IDS.SETTINGS_PANEL),
			o = document.getElementById(CONFIG.ELEMENT_IDS.OVERLAY);
		if (p) p.style.display = 'none';
		if (o) o.style.display = 'none';
		if (document.body) document.body.style.overflow = 'auto';
		log(FN, '主面板已隐藏');
	}

	function toggleMainSettingsPanel() {
		const FN = 'toggleMainSettingsPanel';
		log(FN, '切换主面板状态');
		let p = document.getElementById(CONFIG.ELEMENT_IDS.SETTINGS_PANEL);
		if (!p) {
			log(FN, '面板未找到，重建并打开');
			initializeMainUIElements();
			p = document.getElementById(CONFIG.ELEMENT_IDS.SETTINGS_PANEL);
			if (!p) {
				log(FN, '重建失败，中止');
				return;
			}
			openMainSettingsPanel();
			return;
		}
		if (window.getComputedStyle(p).display === 'none') openMainSettingsPanel();
		else closeMainSettingsPanel();
		log(FN, '主面板状态切换完毕');
	}

	function refreshMainSettingsPanelUI() {
		const FN = 'refreshMainSettingsPanelUI';
		log(FN, '刷新主设置面板内各控件状态。');
		const itemsConfig = [{
			id: 'showPoints'
		}, {
			id: 'hideSidebarEntry'
		}, {
			id: 'hideScrollToEnd'
		}, {
			id: 'optimizeUI'
		}, {
			id: 'enableLogging'
		}, {
			id: 'customAvatar',
			type: 'file_custom'
		}];
		itemsConfig.forEach(iC => {
			const k = iC.id;
			if (iC.type !== 'file_custom') {
				const cb = document.getElementById(`aizex-enhancer-chk-${k}`);
				if (cb) {
					const eS = !!currentSettings[k];
					if (cb.checked !== eS) {
						cb.checked = eS;
						const sC = cb.closest('.custom-toggle-switch');
						if (sC) {
							const s = sC.querySelector('.slider'),
								n = sC.querySelector('.knob');
							if (s) s.style.backgroundColor = eS ? '#000' : '#e3e3e3';
							if (n) n.style.left = eS ? '26px' : '4px';
						}
					}
				}
			} else if (k === 'customAvatar') {
				const sB = document.getElementById(`aizex-enhancer-selbtn-${k}`);
				if (sB) {
					const avSet = currentSettings[k];
					sB.textContent = (avSet && avSet.isSet && avSet.dataUrl) ? CONFIG.TEXT.AVATAR_BTN_SELECTED : CONFIG.TEXT.AVATAR_BTN_SELECT;
				}
			}
		});
		log(FN, '刷新完毕。');
	}

	function createMainOverlay() {
		const FN = 'createMainOverlay';
		log(FN, '创建主遮罩');
		if (document.getElementById(CONFIG.ELEMENT_IDS.OVERLAY)) {
			log(FN, '遮罩已存在');
			return;
		}
		const o = document.createElement('div');
		o.id = CONFIG.ELEMENT_IDS.OVERLAY;
		Object.assign(o.style, {
			display: 'none',
			position: 'fixed',
			top: '0',
			left: '0',
			width: '100%',
			height: '100%',
			backgroundColor: 'rgba(0,0,0,0.65)',
			zIndex: '2147483646'
		});
		if (document.body) document.body.appendChild(o);
		else log(FN, '错误:body未找到');
		log(FN, '创建完毕');
	}

	function addMainGlobalStyles() {
		const FN = 'addMainGlobalStyles';
		log(FN, '注入全局CSS');
		GM_addStyle(`#${CONFIG.ELEMENT_IDS.SCROLLABLE_CONTENT_AREA}::-webkit-scrollbar{width:8px;background-color:transparent}#${CONFIG.ELEMENT_IDS.SCROLLABLE_CONTENT_AREA}::-webkit-scrollbar-track{background-color:transparent;border-radius:4px;margin-block:2px}#${CONFIG.ELEMENT_IDS.SCROLLABLE_CONTENT_AREA}::-webkit-scrollbar-thumb{background-color:#ccc;border-radius:4px;border:2px solid #f9f9f9}#${CONFIG.ELEMENT_IDS.SCROLLABLE_CONTENT_AREA}::-webkit-scrollbar-thumb:hover{background-color:#aaa;border-color:#f0f0f0}#${CONFIG.ELEMENT_IDS.SCROLLABLE_CONTENT_AREA}::-webkit-scrollbar-button{display:none}#${CONFIG.ELEMENT_IDS.SCROLLABLE_CONTENT_AREA}{scrollbar-width:thin;scrollbar-color:#ccc #f9f9f9}`);
		log(FN, '注入完毕');
	}

	function initializeMainUIElements() {
		const FN = 'initializeMainUIElements';
		log(FN, '初始化主UI元素');
		createMainOverlay();
		if (!document.getElementById(CONFIG.ELEMENT_IDS.SETTINGS_PANEL)) createMainSettingsPanel();
		else refreshMainSettingsPanelUI();
		attemptAdvancedButtonInsertion();
		log(FN, '初始化完毕');
	}

	function attemptAdvancedButtonInsertion() {
		const FN = 'attemptAdvancedButtonInsertion';
		log(FN, '尝试注入“高级设置”按钮');
		const tE = document.querySelector(CONFIG.SELECTORS.ADVANCED_SETTINGS_BUTTON_TARGET_CONTAINER);
		if (tE) {
			log(FN, '找到注入目标容器');
			if (mainSettingsButtonObserver) {
				mainSettingsButtonObserver.disconnect();
				mainSettingsButtonObserver = null;
				log(FN, '已停止主按钮观察器');
			}
			if (!document.getElementById(CONFIG.ELEMENT_IDS.ADVANCED_SETTINGS_BUTTON)) {
				log(FN, '按钮不在DOM中，创建并注入');
				const aB = createAdvancedSettingsButton();
				if (aB) tE.insertBefore(aB, tE.firstChild);
				log(FN, '按钮已注入');
			} else {
				log(FN, '按钮已存在');
			}
		} else {
			log(FN, '未找到注入目标容器');
			if (!mainSettingsButtonObserver) {
				log(FN, '启动主按钮观察器');
				mainSettingsButtonObserver = new MutationObserver(() => {
					if (document.querySelector(CONFIG.SELECTORS.ADVANCED_SETTINGS_BUTTON_TARGET_CONTAINER)) {
						log(FN, '主按钮观察器:目标出现!');
						attemptAdvancedButtonInsertion();
					}
				});
				try {
					mainSettingsButtonObserver.observe(document.documentElement, {
						childList: true,
						subtree: true
					});
				} catch (e) {
					log(FN, '错误(主按钮观察器启动):', e);
					mainSettingsButtonObserver = null;
				}
			}
		}
		log(FN, '执行完毕');
	}
	let mainUrlCheckIntervalId = null;

	function startMainURLChangeDetector() {
		const FN = 'startMainURLChangeDetector';
		log(FN, '启动URL变化检测器');
		if (mainUrlCheckIntervalId !== null) {
			log(FN, '检测器已运行');
			return;
		}
		mainUrlCheckIntervalId = setInterval(checkMainURLChange, 1000);
		log(FN, `URL变化检测器已启动(ID:${mainUrlCheckIntervalId})`);
	}

	function checkMainURLChange() {
		const FN = 'checkMainURLChange';
		const currentUrl = window.location.href;
		if (currentUrl !== previousUrl) {
			log(FN, `检测到URL变化! 旧:"${previousUrl}", 新:"${currentUrl}"`);
			previousUrl = currentUrl;
			log(FN, '  因URL变化，重新应用各项功能...');
			attemptAdvancedButtonInsertion();
			if (isPointsDisplayFeatureActive) {
				attemptQuotaPanelInsertion();
				fetchQuotaData('URL发生变化');
			}
			if (isHideSidebarEntryFeatureActive) {
				manageToggleButtonVisibility();
			}
			if (isHideScrollToEndButtonFeatureActive) {
				manageScrollToEndButtonVisibility();
			}
			if (isOptimizeUIFeatureActive) {
				manageOptimizeUITarget();
			}
			if (currentSettings.customAvatar && currentSettings.customAvatar.dataUrl) {
				applyCustomAvatarToPage();
			}
			const panel = document.getElementById(CONFIG.ELEMENT_IDS.SETTINGS_PANEL);
			if (panel && window.getComputedStyle(panel).display !== 'none') {
				log(FN, '  URL变化时主设置面板为打开状态，将自动关闭。');
				closeMainSettingsPanel();
			}
		}
	}

	// --- 脚本执行入口 (Main Execution Block) ---
	async function main() {
		const FN = 'main';
		const scriptInfo = typeof GM_info !== 'undefined' ? GM_info.script : {
			version: CONFIG.SCRIPT_VERSION
		};
		console.log(`[${CONFIG.SCRIPT_NAME}] ${new Date().toLocaleString()}: 脚本开始执行 (版本: ${scriptInfo.version})。`);

		await loadSettings(); // 步骤1: 加载所有设置 (包括日志开关)
		log(FN, `主函数已开始。已加载设置。当前日志输出状态: ${currentSettings.enableLogging}`);
		log(FN, `  详细设置状态: 积分显示:${currentSettings.showPoints}, 隐藏侧边栏:${currentSettings.hideSidebarEntry}, 隐藏滚动末尾按钮:${currentSettings.hideScrollToEnd}, 优化UI:${currentSettings.optimizeUI}, 自定义头像:${!!(currentSettings.customAvatar && currentSettings.customAvatar.dataUrl)}`);

		log(FN, '调用 addMainGlobalStyles 注入全局CSS样式 (如滚动条美化)...');
		addMainGlobalStyles();

		const readyState = document.readyState;
		log(FN, `当前 document.readyState 为: "${readyState}"`);

		// 定义一个在DOM就绪后统一初始化所有功能状态的函数
		const initializeAllFeatureStates = () => {
			const IAFS_FN = 'initializeAllFeatureStates';
			log(IAFS_FN, '开始根据当前已加载的设置，初始化所有功能模块的激活状态...');
			togglePointsDisplayFeature(currentSettings.showPoints);
			toggleHideSidebarEntryFeature(currentSettings.hideSidebarEntry);
			toggleHideScrollToEndButtonFeature(currentSettings.hideScrollToEnd);
			toggleOptimizeUIFeature(currentSettings.optimizeUI);
			initializeCustomAvatarState(); // 自定义头像有其特殊的初始化逻辑
			log(IAFS_FN, '所有功能模块的状态初始化已完成。');
		};

		if (readyState === 'loading') {
			log(FN, 'DOM正在加载中 ("loading")。将添加 "DOMContentLoaded" 事件监听器，在DOM完全构建并解析后执行核心初始化。');
			document.addEventListener('DOMContentLoaded', () => {
				const DCL_FN = 'DOMContentLoaded_Callback';
				log(DCL_FN, '"DOMContentLoaded" 事件已触发。脚本将开始执行核心UI初始化和功能启动。');
				log(DCL_FN, '  调用 initializeMainUIElements 初始化主UI元素 (高级设置按钮、面板等)...');
				initializeMainUIElements();
				log(DCL_FN, '  调用 startMainURLChangeDetector 启动URL变化检测器...');
				startMainURLChangeDetector();
				log(DCL_FN, '  调用 initializeAllFeatureStates 根据已加载的设置初始化各功能模块...');
				initializeAllFeatureStates();
				log(DCL_FN, '脚本核心UI初始化及所有功能模块的状态设置已在 "DOMContentLoaded" 事件后成功完成。');
			});
		} else {
			log(FN, 'DOM已加载完成 (或处于 interactive/complete 状态)。将立即执行核心初始化。');
			log(FN, '  调用 initializeMainUIElements 初始化主UI元素...');
			initializeMainUIElements();
			log(FN, '  调用 startMainURLChangeDetector 启动URL变化检测器...');
			startMainURLChangeDetector();
			log(FN, '  调用 initializeAllFeatureStates 根据已加载的设置初始化各功能模块...');
			initializeAllFeatureStates();
			log(FN, '脚本核心UI初始化及所有功能模块的状态设置已基于当前DOM就绪状态立即完成。');
		}
		log(FN, '主函数的同步部分执行接近尾声。脚本现在将由事件监听器和定时器等异步机制驱动。');
	}

	// 启动脚本主逻辑，并使用 try...catch 块捕获任何未在 main 函数内部处理的顶层异常
	try {
		main();
	} catch (err) {
		const errorTimestamp = new Date().toLocaleString();
		const scriptVersionInfo = typeof GM_info !== 'undefined' ? `(v${GM_info.script.version})` : `(v${CONFIG.SCRIPT_VERSION})`;
		console.error(`[${CONFIG.SCRIPT_NAME}] ${errorTimestamp}: 脚本顶层执行 (main函数调用栈之外) 捕获到严重错误:`, err);
		// 尝试使用 log 函数记录，但这依赖于 currentSettings.enableLogging 是否已正确加载和设置
		// 如果 loadSettings 本身失败，currentSettings 可能还是初始的 {enableLogging: false}
		log('TOP_LEVEL_CATCH', `脚本顶层捕获到严重错误: 信息="${err.message}", 堆栈:`, err.stack || '(无可用堆栈信息)');
	}

})();