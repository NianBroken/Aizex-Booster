// ==UserScript==
// @name         Aizex增强插件
// @namespace    https://www.klaio.top/
// @version      1.0.1
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
		SCRIPT_VERSION: '1.0.1', // 脚本版本号，用于日志输出和问题追踪。

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
			// “隐藏侧边工具栏入口”功能还将尝试移除此选择器指向的状态侧边栏元素。
			STATUS_SIDEBAR: "#StatusSidebar", // 新增：状态侧边栏的选择器
			// “隐藏滚动至末尾按钮”功能将尝试移除此选择器指向的按钮。
			SCROLL_TO_END_BUTTON: "#thread > div > div.flex.shrink.basis-auto.flex-col.overflow-hidden.-mb-\\(--composer-overlap-px\\).\\[--composer-overlap-px\\:24px\\].grow > div > div > div.\\@thread-xl\\/thread\\:pt-header-height.mt-1\\.5.flex.flex-col.text-sm.md\\:pb-9 > div:nth-child(5) > button",
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
            HIDE_SIDEBAR_STYLE_TAG: 'aizex-enhancer-hide-sidebar-style', // 新增：用于隐藏侧边栏的<style>标签ID
		},

		// --- 本地存储键名 ---
		// 用于在油猴脚本管理器提供的存储中保存用户设置和缓存数据。
		// 修改这些键名将导致用户之前保存的设置和数据无法被脚本识别。
		STORAGE_KEYS: {
			MAIN_SETTINGS: 'aizex_enhancer_settings', // 主设置对象存储键
			QUOTA_DATA: 'aizex_enhancer_quota_data', // 积分数据对象存储键
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
		hideSidebarEntry: false, // 是否隐藏侧边栏入口按钮(#toggleButton)及状态侧边栏(#StatusSidebar)
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
						// applyCustomAvatarToPage 内部会处理观察器的停止
						applyCustomAvatarToPage();
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
			// 注意：当功能禁用时，被移除的原始元素不会自动恢复，这是设计行为。
			// 如果需要恢复，则 manageOptimizeUITarget 中移除元素时需要保存副本或采用其他隐藏方式。
		}
		log(FN, `执行完毕。当前状态 (isOptimizeUIFeatureActive): ${isOptimizeUIFeatureActive}`);
	}

	function manageOptimizeUITarget() {
		const FN = 'manageOptimizeUITarget';
		log(FN, '开始管理“优化界面”目标元素。');
		if (!isOptimizeUIFeatureActive) {
			log(FN, '  “优化界面”功能未激活，取消操作。如果观察器在运行，则停止。');
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
				log(FN, '  严重错误: “优化界面”目标元素没有父节点，无法插入占位符或移除元素。');
				return;
			}

			let placeholder = document.getElementById(CONFIG.ELEMENT_IDS.OPTIMIZE_UI_PLACEHOLDER);
			// 确保占位符如果存在，是在正确的父节点下，否则视为无效
			if (placeholder && placeholder.parentNode !== parent) {
				log(FN, '  发现一个孤立的或位置错误的占位符，将忽略它并重新创建。');
				placeholder = null; // 让后续逻辑重新创建
			}

			if (!placeholder) {
				log(FN, '  当前DOM中未找到有效的“优化界面”占位符，或占位符位置不正确。将创建并插入一个新的1rem高占位符。');
				placeholder = document.createElement('div');
				placeholder.id = CONFIG.ELEMENT_IDS.OPTIMIZE_UI_PLACEHOLDER;
				placeholder.style.height = '1rem'; // 设置占位符高度
				placeholder.style.width = '100%'; // 确保占位符宽度与父容器一致
				placeholder.setAttribute('data-comment', `${CONFIG.SCRIPT_NAME} 创建的优化界面占位符`);
				parent.insertBefore(placeholder, targetElement); // 将占位符插入到目标元素之前
				log(FN, '  新的“优化界面”占位符已成功插入到目标元素之前。');
			} else {
				log(FN, '  已在正确位置找到有效的“优化界面”占位符，无需重新创建。');
			}
			try {
				targetElement.remove(); // 移除目标元素
				log(FN, '  目标“优化界面”元素已成功从DOM中移除。');
			} catch (e) {
				log(FN, '  移除目标“优化界面”元素时发生错误:', e);
			}
			// 成功处理后，如果观察器在运行，可以停止它，因为元素已被处理。
			// 但为了应对元素可能被动态重新添加的情况，保持观察器运行是更稳健的做法，
			// 除非明确知道元素不会被重新添加。当前实现倾向于在功能激活时保持观察器。
			// 如果决定停止，应在此处添加:
			// if (optimizeUITargetObserver) { optimizeUITargetObserver.disconnect(); optimizeUITargetObserver = null; }
		} else {
			log(FN, '  当前DOM中未找到“优化界面”目标元素。');
			// 检查占位符是否已存在。如果目标元素没了但占位符还在，说明可能已被处理或页面结构变化。
			const existingPlaceholder = document.getElementById(CONFIG.ELEMENT_IDS.OPTIMIZE_UI_PLACEHOLDER);
			if (existingPlaceholder) {
				log(FN, '  虽然未找到目标元素，但“优化界面”的占位符已存在。可能元素已被移除。无需进一步操作。');
				// 同样，如果观察器在运行，可以考虑停止。
				return; // 避免启动新的观察器
			}
			// 如果目标元素未找到，占位符也不存在，且功能已激活，且观察器未运行，则启动观察器
			if (!optimizeUITargetObserver && isOptimizeUIFeatureActive) {
				log(FN, '  当前没有活动的 optimizeUITargetObserver，且“优化界面”功能已激活。将创建并启动一个新的 MutationObserver 等待目标元素出现。');
				optimizeUITargetObserver = new MutationObserver((mutationsList, obs) => {
					// log(FN, 'optimizeUITargetObserver: MutationObserver 回调被触发。'); // 可能过于频繁
					if (!isOptimizeUIFeatureActive) { // 如果在等待期间功能被禁用了
						log(FN, '  optimizeUITargetObserver 回调：但此时“优化界面”功能已禁用。将停止此观察器。');
						obs.disconnect();
						optimizeUITargetObserver = null;
						return;
					}
					// 再次检查目标元素是否出现
					if (document.querySelector(CONFIG.SELECTORS.OPTIMIZE_UI_TARGET_ELEMENT)) {
						log(FN, '  optimizeUITargetObserver 回调：成功检测到“优化界面”目标元素已出现在DOM中！将再次调用 manageOptimizeUITarget 进行处理。');
						manageOptimizeUITarget(); // 重新执行管理逻辑
						// manageOptimizeUITarget 内部现在不自动停止观察器，以保持持续监控
					}
				});
				try {
					optimizeUITargetObserver.observe(document.documentElement, {
						childList: true,
						subtree: true
					});
					log(FN, '  optimizeUITargetObserver 已成功启动，正在监视整个文档的DOM变化。');
				} catch (e) {
					log(FN, '  严重错误: optimizeUITargetObserver 启动失败:', e);
					optimizeUITargetObserver = null;
				}
			} else if (optimizeUITargetObserver && isOptimizeUIFeatureActive) {
				log(FN, '  optimizeUITargetObserver 已在运行中，将继续等待“优化界面”目标元素出现。');
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
			log(FN, '  “隐藏滚动至末尾按钮”功能已激活。调用 manageScrollToEndButtonVisibility 处理目标按钮。');
			manageScrollToEndButtonVisibility();
		} else {
			log(FN, '  “隐藏滚动至末尾按钮”功能已禁用。如果 scrollToEndButtonObserver 在运行，则停止它。');
			if (scrollToEndButtonObserver) {
				scrollToEndButtonObserver.disconnect();
				scrollToEndButtonObserver = null;
				log(FN, '    scrollToEndButtonObserver 已成功停止。');
			}
			// 注意：当功能禁用时，被移除的按钮不会自动恢复。
		}
		log(FN, `执行完毕。当前“隐藏滚动至末尾按钮”功能状态 (isHideScrollToEndButtonFeatureActive): ${isHideScrollToEndButtonFeatureActive}`);
	}

	function manageScrollToEndButtonVisibility() {
		const FN = 'manageScrollToEndButtonVisibility';
		log(FN, '开始管理“滚动至末尾按钮”的可见性。');
		if (!isHideScrollToEndButtonFeatureActive) {
			log(FN, '  “隐藏滚动至末尾按钮”功能未激活，取消操作。如果观察器在运行，则停止。');
			if (scrollToEndButtonObserver) {
				scrollToEndButtonObserver.disconnect();
				scrollToEndButtonObserver = null;
			}
			return;
		}
		const btn = document.querySelector(CONFIG.SELECTORS.SCROLL_TO_END_BUTTON);
		if (btn) {
			log(FN, '  成功找到“滚动至末尾按钮”，准备将其从DOM中移除:', btn);
			try {
				btn.remove();
				log(FN, '  “滚动至末尾按钮”已成功移除。');
				// 元素移除后，如果观察器在运行，可以考虑停止。但为了持续性，保持运行。
			} catch (error) {
				log(FN, '  移除“滚动至末尾按钮”时发生错误:', error);
			}
		} else {
			log(FN, '  当前DOM中未找到“滚动至末尾按钮”。');
			// 如果按钮未找到，功能已激活，且观察器未运行，则启动观察器
			if (!scrollToEndButtonObserver && isHideScrollToEndButtonFeatureActive) {
				log(FN, '  当前没有活动的 scrollToEndButtonObserver，且功能已激活。将创建并启动一个新的 MutationObserver 等待按钮出现。');
				scrollToEndButtonObserver = new MutationObserver((mutationsList, obs) => {
					// log(FN, 'scrollToEndButtonObserver: MutationObserver 回调被触发。');
					if (!isHideScrollToEndButtonFeatureActive) {
						log(FN, '  scrollToEndButtonObserver 回调：但此时功能已禁用。将停止此观察器。');
						obs.disconnect();
						scrollToEndButtonObserver = null;
						return;
					}
					if (document.querySelector(CONFIG.SELECTORS.SCROLL_TO_END_BUTTON)) {
						log(FN, '  scrollToEndButtonObserver 回调：成功检测到“滚动至末尾按钮”已出现在DOM中！将再次调用 manageScrollToEndButtonVisibility。');
						manageScrollToEndButtonVisibility();
					}
				});
				try {
					scrollToEndButtonObserver.observe(document.documentElement, {
						childList: true,
						subtree: true
					});
					log(FN, '  scrollToEndButtonObserver 已成功启动，监视整个文档。');
				} catch (e) {
					log(FN, '  严重错误: scrollToEndButtonObserver 启动失败:', e);
					scrollToEndButtonObserver = null;
				}
			} else if (scrollToEndButtonObserver && isHideScrollToEndButtonFeatureActive) {
				log(FN, '  scrollToEndButtonObserver 已在运行中，继续等待按钮出现。');
			}
		}
		log(FN, '执行完毕。');
	}

	// --- 功能模块: 隐藏侧边工具栏入口 (及状态侧边栏) ---
	/**
	 * @description 切换“隐藏侧边工具栏入口”功能的激活状态。
	 * 此功能现在会通过动态添加/移除CSS样式来隐藏/显示目标元素，实现立即生效。
	 * @param {boolean} enable - true 表示激活功能（隐藏），false 表示禁用（显示）。
	 */
	function toggleHideSidebarEntryFeature(enable) {
		const FN = 'toggleHideSidebarEntryFeature';
		log(FN, `请求设置“隐藏侧边工具栏入口及状态侧边栏”功能为: ${enable}`);
		isHideSidebarEntryFeatureActive = enable; // 更新全局状态标志

		const styleId = CONFIG.ELEMENT_IDS.HIDE_SIDEBAR_STYLE_TAG;
		let styleElement = document.getElementById(styleId);

		if (enable) {
			// 功能开启：如果样式不存在，则创建并添加
			log(FN, '  功能已激活。将通过注入CSS样式来隐藏目标元素。');
			if (!styleElement) {
				const cssRules = `
                    ${CONFIG.SELECTORS.SIDEBAR_TOGGLE_BUTTON},
                    ${CONFIG.SELECTORS.STATUS_SIDEBAR} {
                        display: none !important;
                    }
                `;
				styleElement = document.createElement('style');
				styleElement.id = styleId;
				styleElement.textContent = cssRules;
				(document.head || document.documentElement).appendChild(styleElement);
				log(FN, `  已成功注入ID为 "${styleId}" 的style标签以隐藏侧边栏元素。`);
			} else {
				log(FN, `  ID为 "${styleId}" 的style标签已存在，无需重复注入。`);
			}
		} else {
			// 功能关闭：如果样式存在，则移除
			log(FN, '  功能已禁用。将移除用于隐藏侧边栏元素的CSS样式。');
			if (styleElement) {
				styleElement.remove();
				log(FN, `  已成功移除ID为 "${styleId}" 的style标签，侧边栏元素应恢复显示。`);
			} else {
				log(FN, '  未找到需要移除的style标签。');
			}
		}
		log(FN, `执行完毕。当前功能状态 (isHideSidebarEntryFeatureActive): ${isHideSidebarEntryFeatureActive}`);
	}


	// --- 功能模块: 积分显示 ---
	async function togglePointsDisplayFeature(enable) {
		const FN = 'togglePointsDisplayFeature';
		log(FN, `请求设置“积分显示”功能为: ${enable}`);
		isPointsDisplayFeatureActive = enable;
		if (enable) {
			log(FN, '  “积分显示”功能已激活。');
			await loadSavedQuotaData(); // 加载本地缓存的积分数据
			updateQuotaPanelUI(lastQuotaData); // 立即用缓存数据（或默认值）更新UI
			attemptQuotaPanelInsertion(); // 尝试将积分面板注入到DOM
			fetchQuotaData('功能启用'); // 首次获取最新积分数据
			startAutoRefreshTimer(); // 启动自动刷新定时器
		} else {
			log(FN, '  “积分显示”功能已禁用。');
			removeQuotaPanel(); // 从DOM中移除积分面板
			stopAutoRefreshTimer(); // 停止自动刷新定时器
			// 如果 pointsPanelTargetObserver 在运行，也应在此处停止
			if (pointsPanelTargetObserver) {
				pointsPanelTargetObserver.disconnect();
				pointsPanelTargetObserver = null;
				log(FN, '    pointsPanelTargetObserver 已停止。');
			}
		}
		log(FN, `执行完毕。当前“积分显示”功能状态 (isPointsDisplayFeatureActive): ${isPointsDisplayFeatureActive}`);
	}

	function getPointsTargetElement() {
		return document.querySelector(CONFIG.SELECTORS.POINTS_PANEL_TARGET_CONTAINER);
	}

	function createQuotaPanelHTML() {
		log('createQuotaPanelHTML: 生成积分面板HTML结构。');
		// 使用默认值填充HTML，这些值将在 updateQuotaPanelUI 中被实际数据替换
		return `
			<div
				id="${CONFIG.ELEMENT_IDS.QUOTA_PANEL_CONTAINER}"
				style="position:sticky; /* 使其在父容器内滚动时固定在底部 */
				bottom:0; /* 定位到底部 */
				left:0; /* 定位到左侧 */
				width:100%; /* 宽度充满父容器 */
				font-size:.68rem; /* 稍小的字体 */
				text-align:left; /* 文本左对齐 */
				border-top:1px solid #dcdcdc; /* 顶部边框作为分隔 */
				padding:.4rem .4rem .4rem 0; /* 内边距，左侧为0以对齐父元素 */
				box-sizing:border-box; /* padding和border不增加总宽度 */
				background:#f9f9f9" /* 背景色 */
				>
				<div
					class="quota-panel-interactive" /* 用于交互的内部容器 */
					style="padding:.4rem; /* 交互区域的内边距 */
					transition:background .2s, border-radius .2s" /* 悬停效果的过渡 */
					onmouseover="this.style.background='#efefef'; this.style.borderRadius='10px'" /* 悬停背景和圆角 */
					onmouseout="this.style.background=''; this.style.borderRadius=''" /* 移开时恢复 */
					onmousedown="this.style.background='#eaeaea'" /* 点击时背景 */
					onmouseup="this.style.background='#efefef'" /* 松开时恢复到悬停背景 */
					title="点击可手动刷新积分信息" /* 鼠标悬停提示 */
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
		log(FN, '开始尝试将积分面板注入到DOM中。');
		// 如果积分显示功能未激活，则不执行任何操作，并确保观察器已停止
		if (!isPointsDisplayFeatureActive) {
			log(FN, '  “积分显示”功能未激活，取消注入操作。如果 pointsPanelTargetObserver 在运行，则停止它。');
			if (pointsPanelTargetObserver) {
				pointsPanelTargetObserver.disconnect();
				pointsPanelTargetObserver = null;
				log(FN, '    pointsPanelTargetObserver 已停止。');
			}
			return;
		}

		const targetElement = getPointsTargetElement(); // 查找注入目标容器
		if (targetElement) {
			log(FN, '  成功找到积分面板的注入目标容器:', targetElement);
			// 目标容器已找到，如果观察器在运行，现在可以停止它，因为任务已完成。
			if (pointsPanelTargetObserver) {
				pointsPanelTargetObserver.disconnect();
				pointsPanelTargetObserver = null;
				log(FN, '    目标容器已找到，pointsPanelTargetObserver 已停止。');
			}

			// 检查积分面板是否已存在于DOM中
			if (!document.getElementById(CONFIG.ELEMENT_IDS.QUOTA_PANEL_CONTAINER)) {
				log(FN, '  积分面板当前不在DOM中，将执行注入操作。');
				targetElement.insertAdjacentHTML('beforeend', createQuotaPanelHTML()); // 注入HTML
				log(FN, '  积分面板HTML已成功注入到目标容器的末尾。');

				// 为注入的面板的交互区域添加点击事件监听器，用于手动刷新
				const interactiveElement = targetElement.querySelector(`#${CONFIG.ELEMENT_IDS.QUOTA_PANEL_CONTAINER} .quota-panel-interactive`);
				if (interactiveElement) {
					interactiveElement.addEventListener('click', (event) => {
						// 确保是鼠标左键点击
						if (event.button === 0) {
							log(FN, '  积分面板的交互区域被用户左键点击。将触发一次手动积分数据获取。');
							fetchQuotaData('手动点击面板'); // 调用API获取数据
						}
					});
					log(FN, '  已为积分面板的交互区域成功添加了点击事件监听器（用于手动刷新）。');
				} else {
					log(FN, '  警告: 注入积分面板后，未能找到其交互区域 (.quota-panel-interactive) 来附加点击事件。');
				}
			} else {
				log(FN, '  积分面板 (ID:', CONFIG.ELEMENT_IDS.QUOTA_PANEL_CONTAINER, ') 已存在于DOM中，无需重新注入。');
			}
			// 无论是否新注入，都用当前数据更新UI显示
			updateQuotaPanelUI(lastQuotaData);
		} else {
			log(FN, '  当前DOM中未找到积分面板的注入目标容器 (选择器:', CONFIG.SELECTORS.POINTS_PANEL_TARGET_CONTAINER, ')。');
			// 如果目标容器未找到，功能已激活，且观察器未运行，则启动观察器
			if (!pointsPanelTargetObserver && isPointsDisplayFeatureActive) {
				log(FN, '  当前没有活动的 pointsPanelTargetObserver，且“积分显示”功能已激活。将创建并启动一个新的 MutationObserver 等待目标容器出现。');
				pointsPanelTargetObserver = new MutationObserver((mutationsList, obs) => {
					// log(FN, 'pointsPanelTargetObserver: MutationObserver 回调被触发。');
					// 再次检查功能是否仍然激活
					if (!isPointsDisplayFeatureActive) {
						log(FN, '  pointsPanelTargetObserver 回调：但此时“积分显示”功能已禁用。将停止此观察器。');
						obs.disconnect();
						pointsPanelTargetObserver = null;
						return;
					}
					// 检查目标容器是否已出现
					if (getPointsTargetElement()) {
						log(FN, '  pointsPanelTargetObserver 回调：成功检测到积分面板的注入目标容器已出现在DOM中！将再次调用 attemptQuotaPanelInsertion。');
						attemptQuotaPanelInsertion(); // 重新尝试注入
						// attemptQuotaPanelInsertion 内部会在成功找到目标后停止此观察器
					}
				});
				try {
					pointsPanelTargetObserver.observe(document.documentElement, {
						childList: true,
						subtree: true
					});
					log(FN, '  pointsPanelTargetObserver 已成功启动，正在监视整个文档的DOM变化以查找注入目标容器。');
				} catch (e) {
					log(FN, '  严重错误: pointsPanelTargetObserver 启动失败:', e);
					pointsPanelTargetObserver = null;
				}
			} else if (pointsPanelTargetObserver && isPointsDisplayFeatureActive) {
				log(FN, '  pointsPanelTargetObserver 已在运行中，将继续等待积分面板注入目标容器出现。');
			}
		}
		log(FN, '执行完毕。');
	}

	function removeQuotaPanel() {
		const FN = 'removeQuotaPanel';
		const panelElement = document.getElementById(CONFIG.ELEMENT_IDS.QUOTA_PANEL_CONTAINER);
		if (panelElement) {
			panelElement.remove();
			log(FN, '积分面板 (ID:', CONFIG.ELEMENT_IDS.QUOTA_PANEL_CONTAINER, ') 已成功从DOM中移除。');
		} else {
			log(FN, '尝试移除积分面板，但未在DOM中找到该元素。无需操作。');
		}
	}
	async function loadSavedQuotaData() {
		const FN = 'loadSavedQuotaData';
		log(FN, '开始从本地存储加载已保存的积分数据。存储键:', CONFIG.STORAGE_KEYS.QUOTA_DATA);
		try {
			const savedData = await GM_getValue(CONFIG.STORAGE_KEYS.QUOTA_DATA, null); // 第二个参数为默认值
			if (savedData && typeof savedData === 'object') {
				lastQuotaData = savedData;
				log(FN, '  成功从本地存储加载了积分数据:', lastQuotaData);
			} else {
				lastQuotaData = null; // 确保如果存储中无有效数据，则 lastQuotaData 为 null
				log(FN, '  本地存储中未找到有效的积分数据，或数据格式不正确。lastQuotaData 已被设置为 null。');
			}
		} catch (error) {
			lastQuotaData = null; // 发生任何错误也回退到 null
			console.error(`[${CONFIG.SCRIPT_NAME}] ${new Date().toLocaleString()}: ${FN}: 加载本地积分数据时发生错误:`, error);
			log(FN, '  加载本地积分数据过程中发生异常。lastQuotaData 已被强制设置为 null。');
		}
		log(FN, '执行完毕。');
	}
	async function saveQuotaData(data) {
		const FN = 'saveQuotaData';
		log(FN, '准备将新的积分数据保存到本地存储。提供的数据:', data);
		if (!data || typeof data !== 'object') {
			log(FN, '  提供的数据无效 (非对象或为null/undefined)，取消保存操作。');
			// 考虑是否应该清除本地存储中的旧数据，如果新数据无效
			// 当前行为：不保存无效数据，lastQuotaData 保持不变（或由 fetchQuotaData 的错误处理逻辑更新）
			return;
		}
		lastQuotaData = data; // 更新内存中的缓存
		try {
			await GM_setValue(CONFIG.STORAGE_KEYS.QUOTA_DATA, data);
			log(FN, '  积分数据已成功保存至本地存储。存储键:', CONFIG.STORAGE_KEYS.QUOTA_DATA);
		} catch (error) {
			console.error(`[${CONFIG.SCRIPT_NAME}] ${new Date().toLocaleString()}: ${FN}: 保存积分数据到本地存储时发生错误:`, error);
			log(FN, '  保存积分数据至本地存储失败。错误详情:', error);
		}
		log(FN, '执行完毕。');
	}

	function updateQuotaPanelUI(sourceData = null) {
		const FN = 'updateQuotaPanelUI';
		log(FN, '开始更新积分面板的UI显示。接收到的源数据 (sourceData):', sourceData);
		const panelElement = document.getElementById(CONFIG.ELEMENT_IDS.QUOTA_PANEL_CONTAINER);
		if (!panelElement) {
			log(FN, '  错误: 积分面板元素 (ID:', CONFIG.ELEMENT_IDS.QUOTA_PANEL_CONTAINER, ') 未在DOM中找到。无法更新UI。');
			return; // 如果面板不存在，则不执行任何操作
		}

		// 定义默认值和占位符，用于数据缺失或无效时显示
		const NONE_PLACEHOLDER = CONFIG.POINTS_PANEL_DEFAULTS.NONE_PLACEHOLDER;
		const DEFAULT_TIME_STRING = CONFIG.POINTS_PANEL_DEFAULTS.TIME_STRING;
		const DEFAULT_MAX_QUOTA = CONFIG.POINTS_PANEL_DEFAULTS.MAX_QUOTA_FALLBACK;
		const DEFAULT_USED_QUOTA = CONFIG.POINTS_PANEL_DEFAULTS.USED_FALLBACK;

		// 辅助函数：安全地获取数据值，如果未定义或为null，则返回占位符
		const getValue = (valueFromData) => (valueFromData !== undefined && valueFromData !== null) ? valueFromData : NONE_PLACEHOLDER;

		// 辅助函数：格式化时间戳。如果时间戳无效或为占位符，则返回相应的字符串。
		const formatTimestamp = (timestamp) => {
			if (timestamp === NONE_PLACEHOLDER) return NONE_PLACEHOLDER; // 直接传递 "None"
			if (typeof timestamp !== 'number' || timestamp <= 0 || isNaN(timestamp)) {
				log(FN, `  提供的时间戳 ("${timestamp}") 无效 (非正数数字或NaN)。将显示为 "${DEFAULT_TIME_STRING}" (或 "${NONE_PLACEHOLDER}" 如果适用)。`);
				// 决定是返回 NONE_PLACEHOLDER 还是 DEFAULT_TIME_STRING
				// 如果原始值就是想表示“无”，则用 NONE_PLACEHOLDER。如果是因为错误，用 DEFAULT_TIME_STRING。
				// 此处逻辑：无效数字时间戳等同于没有有效时间，用默认时间字符串。
				return DEFAULT_TIME_STRING;
			}
			try {
				return new Date(timestamp).toLocaleString(); // 使用浏览器本地化格式
			} catch (e) {
				log(FN, `  错误: 格式化时间戳 ${timestamp} 失败:`, e, `将显示为 "${DEFAULT_TIME_STRING}"。`);
				return DEFAULT_TIME_STRING;
			}
		};

		let generalUsed, generalMax, generalReset, premiumUsed, premiumMax, premiumReset;

		if (sourceData && typeof sourceData === 'object') {
			log(FN, '  检测到有效的 sourceData 对象，将使用它来填充UI。');
			generalUsed = getValue(sourceData.usedQuota);
			generalMax = getValue(sourceData.maxQuota);
			generalReset = formatTimestamp(getValue(sourceData.resetTime));

			premiumUsed = getValue(sourceData.usedProquota); // 注意键名可能是 proQuota 或 proquota
			premiumMax = getValue(sourceData.maxProQuota); // 注意键名可能是 proQuota 或 proquota
			premiumReset = formatTimestamp(getValue(sourceData.proResetTime));
		} else {
			log(FN, '  未提供有效的 sourceData (可能为 null 或非对象)。将使用最终的回退默认值填充UI。');
			generalUsed = DEFAULT_USED_QUOTA;
			generalMax = DEFAULT_MAX_QUOTA;
			generalReset = DEFAULT_TIME_STRING;

			premiumUsed = DEFAULT_USED_QUOTA;
			premiumMax = DEFAULT_MAX_QUOTA;
			premiumReset = DEFAULT_TIME_STRING;
		}

		// 更新通用积分显示
		const generalValueEl = panelElement.querySelector('.quota-general-value');
		if (generalValueEl) generalValueEl.textContent = `${generalUsed}/${generalMax}`;
		else log(FN, '  警告: 未找到 .quota-general-value 元素。');

		const generalResetEl = panelElement.querySelector('.quota-general-reset-value');
		if (generalResetEl) generalResetEl.textContent = generalReset;
		else log(FN, '  警告: 未找到 .quota-general-reset-value 元素。');

		// 更新高级积分显示
		const premiumValueEl = panelElement.querySelector('.quota-premium-value');
		if (premiumValueEl) premiumValueEl.textContent = `${premiumUsed}/${premiumMax}`;
		else log(FN, '  警告: 未找到 .quota-premium-value 元素。');

		const premiumResetEl = panelElement.querySelector('.quota-premium-reset-value');
		if (premiumResetEl) premiumResetEl.textContent = premiumReset;
		else log(FN, '  警告: 未找到 .quota-premium-reset-value 元素。');

		log(FN, `  UI更新结果: 通用积分="${generalUsed}/${generalMax}", 重置="${generalReset}" | 高级积分="${premiumUsed}/${premiumMax}", 重置="${premiumReset}"`);
		log(FN, 'UI更新完毕。');
	}
	async function fetchQuotaData(triggerReason = "未知原因") {
		const FN = 'fetchQuotaData';
		log(FN, `开始通过API获取最新的积分数据。触发原因: "${triggerReason}"`);

		// 如果积分显示功能未激活，则不发起请求
		if (!isPointsDisplayFeatureActive) {
			log(FN, '  “积分显示”功能当前未激活，取消API请求。');
			return;
		}

		// 防止并发请求：如果已有请求正在进行中，则跳过本次请求
		if (isQuotaRequestPending) {
			log(FN, `  检测到已有积分API请求正在进行中。本次由 "${triggerReason}" 触发的请求将被跳过，以避免并发。`);
			return;
		}
		isQuotaRequestPending = true; // 设置请求锁
		log(FN, `  API请求锁已设置 (isQuotaRequestPending = true)。准备向 ${CONFIG.API.QUOTA_URL} 发起GET请求。`);

		// 每次发起新请求时，重置自动刷新计时器（使其从当前开始重新计时）
		resetAutoRefreshTimer(`API请求 (${triggerReason})`);

		GM_xmlhttpRequest({
			method: "GET",
			url: CONFIG.API.QUOTA_URL,
			timeout: CONFIG.API.TIMEOUT_MS, // 设置请求超时时间
			onload: function (response) {
				isQuotaRequestPending = false; // 无论成功失败，在回调结束前释放锁
				log(FN, `  API请求成功 (onload回调)。HTTP状态码: ${response.status}`);
				let parsedData = null;
				try {
					if (response.responseText) {
						parsedData = JSON.parse(response.responseText);
						log(FN, '  成功解析API响应的JSON数据:', parsedData);
						if (parsedData && typeof parsedData === 'object') {
							// 成功获取并解析了有效数据
							saveQuotaData(parsedData); // 保存到本地存储并更新内存中的 lastQuotaData
							updateQuotaPanelUI(parsedData); // 用最新数据更新UI
							log(FN, '  API获取的最新积分数据已成功保存并用于更新UI。');
						} else {
							// JSON解析成功，但结果不是预期的对象格式
							log(FN, '  错误: API响应的JSON数据在解析后并非有效的对象结构。将使用内存中已有的 lastQuotaData (或默认值) 更新UI。');
							updateQuotaPanelUI(lastQuotaData); // 使用旧数据或默认值更新UI
						}
					} else {
						// 响应体为空
						log(FN, '  错误: API响应体 (responseText) 为空。无法解析数据。将使用内存中已有的 lastQuotaData (或默认值) 更新UI。');
						updateQuotaPanelUI(lastQuotaData); // 使用旧数据或默认值更新UI
					}
				} catch (e) {
					// JSON解析失败
					log(FN, '  严重错误: 解析API响应的JSON数据时发生异常:', e, "原始响应文本:", response.responseText, "将使用内存中已有的 lastQuotaData (或默认值) 更新UI。");
					updateQuotaPanelUI(lastQuotaData); // 使用旧数据或默认值更新UI
				}
				log(FN, '  API请求锁已释放 (isQuotaRequestPending = false) - onload回调结束。');
			},
			onerror: function (errorDetails) {
				isQuotaRequestPending = false;
				log(FN, `  API请求发生网络层错误 (onerror回调)。错误详情:`, errorDetails, `HTTP状态 (如果可用): ${errorDetails.status}`);
				updateQuotaPanelUI(lastQuotaData); // 发生错误，使用旧数据或默认值更新UI
				log(FN, '  API请求锁已释放 (isQuotaRequestPending = false) - onerror回调结束。');
			},
			ontimeout: function () {
				isQuotaRequestPending = false;
				log(FN, `  API请求超时 (ontimeout回调)。已超过设定的 ${CONFIG.API.TIMEOUT_MS}ms。`);
				updateQuotaPanelUI(lastQuotaData); // 超时，使用旧数据或默认值更新UI
				log(FN, '  API请求锁已释放 (isQuotaRequestPending = false) - ontimeout回调结束。');
			},
			onabort: function () {
				isQuotaRequestPending = false;
				log(FN, `  API请求被中止 (onabort回调)。`);
				updateQuotaPanelUI(lastQuotaData); // 中止，通常也用旧数据或默认值
				log(FN, '  API请求锁已释放 (isQuotaRequestPending = false) - onabort回调结束。');
			}
		});
		log(FN, '执行完毕 (GM_xmlhttpRequest已异步发起)。');
	}

	function startAutoRefreshTimer() {
		const FN = 'startAutoRefreshTimer';
		log(FN, '尝试启动积分数据自动刷新计时器。');
		// 仅当积分显示功能激活且当前没有活动的计时器时才启动
		if (!isPointsDisplayFeatureActive) {
			log(FN, '  条件不满足：“积分显示”功能未激活。不启动计时器。');
			return;
		}
		if (autoRefreshTimerId) {
			log(FN, `  条件不满足：自动刷新计时器 (ID: ${autoRefreshTimerId}) 已在运行中。不重复启动。`);
			return;
		}

		autoRefreshCountdown = CONFIG.API.QUOTA_AUTO_REFRESH_INTERVAL_S; // 初始化倒计时秒数
		log(FN, `  自动刷新倒计时已初始化为 ${autoRefreshCountdown} 秒。`);

		autoRefreshTimerId = setInterval(() => {
			// 在计时器回调内部首先检查功能是否仍然激活
			if (!isPointsDisplayFeatureActive) {
				log(FN, '  计时器回调：但“积分显示”功能已被禁用。将停止此计时器。');
				stopAutoRefreshTimer(); // 功能禁用则停止计时器
				return;
			}

			autoRefreshCountdown--; // 倒计时减1秒

			// 在特定时间点输出倒计时日志，避免过于频繁
			if ((autoRefreshCountdown % 10 === 0 && autoRefreshCountdown > 0) || (autoRefreshCountdown <= 5 && autoRefreshCountdown > 0)) {
				log(FN, `  自动刷新计时器: ${autoRefreshCountdown} 秒后将自动触发API请求获取积分数据...`);
			}

			if (autoRefreshCountdown <= 0) {
				log(FN, '  自动刷新倒计时结束，准备触发API请求获取积分数据。');
				fetchQuotaData(`${CONFIG.API.QUOTA_AUTO_REFRESH_INTERVAL_S}秒自动刷新`); // 触发数据获取
				autoRefreshCountdown = CONFIG.API.QUOTA_AUTO_REFRESH_INTERVAL_S; // 重置倒计时
				log(FN, `  API请求已触发，倒计时已重置为 ${autoRefreshCountdown} 秒。`);
			}
		}, 1000); // 每秒执行一次回调

		log(FN, '  自动刷新计时器已成功启动 (setInterval ID:', autoRefreshTimerId, `，刷新间隔: ${CONFIG.API.QUOTA_AUTO_REFRESH_INTERVAL_S}秒)。`);
	}

	function stopAutoRefreshTimer() {
		const FN = 'stopAutoRefreshTimer';
		log(FN, '尝试停止积分数据自动刷新计时器。');
		if (autoRefreshTimerId) {
			clearInterval(autoRefreshTimerId); // 清除计时器
			log(FN, '  已成功清除正在运行的自动刷新计时器 (ID:', autoRefreshTimerId, ')。');
			autoRefreshTimerId = null; // 将ID置为null，标记计时器已停止
			autoRefreshCountdown = CONFIG.API.QUOTA_AUTO_REFRESH_INTERVAL_S; // 重置倒计时变量（可选，但保持一致性）
			log(FN, '  计时器ID已置为null，倒计时变量已重置。');
		} else {
			log(FN, '  当前没有活动的自动刷新计时器需要停止。');
		}
	}

	function resetAutoRefreshTimer(reason = "未知原因") {
		const FN = 'resetAutoRefreshTimer';
		log(FN, `因 "${reason}" 请求重置并重启积分数据自动刷新计时器。`);
		// 只有在积分显示功能激活时才执行重置操作
		if (!isPointsDisplayFeatureActive) {
			log(FN, '  “积分显示”功能未激活，不执行计时器重置操作。');
			return;
		}
		stopAutoRefreshTimer(); // 首先停止当前可能在运行的计时器
		startAutoRefreshTimer(); // 然后立即启动一个新的计时器
		log(FN, '  自动刷新计时器已成功重置并重启。');
	}

	// --- 主设置面板UI ---
	function createAdvancedSettingsButton() {
		const FN = 'createAdvancedSettingsButton';
		log(FN, '开始创建“高级设置”按钮。');
		const referenceButton = document.querySelector(CONFIG.SELECTORS.ADVANCED_SETTINGS_BUTTON_STYLE_REFERENCE);
		const button = document.createElement('button');
		button.id = CONFIG.ELEMENT_IDS.ADVANCED_SETTINGS_BUTTON;
		button.textContent = CONFIG.TEXT.ADV_SETTINGS_BUTTON;

		if (!referenceButton) {
			log(FN, '  未找到用于样式参考的按钮 (选择器:', CONFIG.SELECTORS.ADVANCED_SETTINGS_BUTTON_STYLE_REFERENCE, ')。将使用一组默认的CSS class。');
			// 应用一组基础的、可能通用的class
			button.className = 'btn btn-secondary text-token-text-primary relative'; // 默认样式
		} else {
			log(FN, '  成功找到样式参考按钮，将复制其className属性。参考按钮:', referenceButton);
			button.className = referenceButton.className; // 复制样式
		}
		// 确保一些核心class存在，即使参考按钮的class不完整或不适用
		button.classList.add('btn', 'btn-secondary', 'text-token-text-primary', 'relative');
		button.removeAttribute('aria-label'); // 移除可能从参考按钮复制过来的aria-label

		button.addEventListener('click', () => {
			log(FN, `“高级设置”按钮 (ID:${button.id}) 被用户点击。将调用 toggleMainSettingsPanel。`);
			toggleMainSettingsPanel();
		});
		log(FN, '“高级设置”按钮已创建并配置完毕。按钮元素:', button);
		return button;
	}

	function createMainSettingsPanel() {
		const FN = 'createMainSettingsPanel';
		log(FN, '开始创建主设置面板的HTML结构和样式。');
		const panel = document.createElement('div');
		panel.id = CONFIG.ELEMENT_IDS.SETTINGS_PANEL;
		Object.assign(panel.style, {
			display: 'none', // 初始隐藏
			flexDirection: 'column', // 垂直排列子元素
			position: 'fixed', // 固定定位，不随页面滚动
			top: '50%',
			left: '50%',
			transform: 'translate(-50%,-50%)', // 水平垂直居中
			width: '480px', // 面板宽度
			maxWidth: '95%', // 最大宽度，适配小屏幕
			maxHeight: '85vh', // 最大高度，基于视口高度，防止过长
			backgroundColor: '#f9f9f9', // 背景色
			color: '#333', // 默认文字颜色
			padding: '25px', // 内边距
			borderRadius: '10px', // 圆角边框
			boxShadow: '0 12px 30px rgba(0,0,0,0.15)', // 阴影效果
			zIndex: '2147483647', // 确保在最顶层 (略小于Tampermonkey自身UI的最大zIndex)
			fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif' // 系统默认字体栈
		});

		// 面板标题
		const title = document.createElement('h2');
		title.textContent = CONFIG.TEXT.SETTINGS_PANEL_TITLE;
		Object.assign(title.style, {
			textAlign: 'center',
			marginTop: '0',
			marginBottom: '20px',
			fontSize: '1.3rem',
			color: '#000', // 标题颜色
			fontWeight: '600', // 字体加粗
			flexShrink: '0' // 防止标题在空间不足时被压缩
		});
		panel.appendChild(title);

		// 可滚动的内容区域 (用于放置设置项)
		const scrollableArea = document.createElement('div');
		scrollableArea.id = CONFIG.ELEMENT_IDS.SCROLLABLE_CONTENT_AREA;
		Object.assign(scrollableArea.style, {
			flexGrow: '1', // 占据剩余垂直空间
			overflowY: 'auto', // 内容超出时显示垂直滚动条
			minHeight: '0', // 与flexGrow配合，确保正确计算可滚动区域
			paddingRight: '15px' // 为滚动条留出空间，避免内容遮挡 (自定义滚动条时可能需要调整)
		});
		panel.appendChild(scrollableArea);

		// 设置项的容器
		const settingsContainer = document.createElement('div');
		settingsContainer.id = 'aizex-enhancer-main-settings-items-container'; // 用于可能的特定样式或查找
		Object.assign(settingsContainer.style, {
			display: 'flex',
			flexDirection: 'column' // 设置项垂直排列
		});
		scrollableArea.appendChild(settingsContainer);

		// 定义所有设置项的配置
		const itemConfigs = [{
			id: 'showPoints',
			title: CONFIG.TEXT.SETTING_ITEM_TITLES.showPoints
		}, {
			id: 'hideSidebarEntry',
			title: CONFIG.TEXT.SETTING_ITEM_TITLES.hideSidebarEntry
		}, {
			id: 'hideScrollToEnd',
			title: CONFIG.TEXT.SETTING_ITEM_TITLES.hideScrollToEnd
		}, {
			id: 'optimizeUI',
			title: CONFIG.TEXT.SETTING_ITEM_TITLES.optimizeUI
		}, {
			id: 'enableLogging',
			title: CONFIG.TEXT.SETTING_ITEM_TITLES.enableLogging
		}, {
			id: 'customAvatar',
			title: CONFIG.TEXT.SETTING_ITEM_TITLES.customAvatar,
			type: 'file_custom' // 特殊类型：自定义文件上传
		}].map(config => ({
			...config,
			type: config.type || 'toggle' // 默认为 'toggle' 类型
		}));

		// 遍历配置，为每个设置项创建DOM元素并添加到容器
		itemConfigs.forEach(itemConfig => {
			const settingItemElement = createMainSettingItem(itemConfig.id, itemConfig.title, itemConfig.type);
			settingsContainer.appendChild(settingItemElement);
		});

		// 关闭按钮
		const closeButton = document.createElement('button');
		closeButton.textContent = CONFIG.TEXT.CLOSE_PANEL_BUTTON;
		Object.assign(closeButton.style, {
			marginTop: '20px', // 与上方内容间距
			padding: '12px 20px', // 内边距
			width: '100%', // 宽度充满
			border: 'none', // 无边框
			borderRadius: '6px', // 圆角
			backgroundColor: '#007bff', // 背景色 (Bootstrap primary blue)
			color: 'white', // 文字颜色
			cursor: 'pointer', // 鼠标手型
			fontSize: '1rem', // 字体大小
			transition: 'background-color .2s ease', // 背景色过渡效果
			flexShrink: '0' // 防止按钮在空间不足时被压缩
		});
		closeButton.addEventListener('mouseover', () => closeButton.style.backgroundColor = '#0056b3'); // 悬停效果
		closeButton.addEventListener('mouseout', () => closeButton.style.backgroundColor = '#007bff'); // 移开恢复
		closeButton.addEventListener('click', () => closeMainSettingsPanel()); // 点击关闭面板
		panel.appendChild(closeButton);

		// 将创建好的面板添加到文档body中
		if (document.body) {
			document.body.appendChild(panel);
			log(FN, '主设置面板已成功创建并添加到 document.body。');
		} else {
			log(FN, '严重错误: document.body 未找到，无法添加主设置面板。脚本可能在DOM完全加载前运行过早。');
			// 这种情况理论上不应发生，因为脚本通常在 document-start 后，但 DOMContentLoaded 前后执行
		}
		log(FN, '主设置面板创建完毕。面板元素:', panel);
		return panel;
	}

	function createMainSettingItem(id, titleText, type) {
		const FN = 'createMainSettingItem';
		log(FN, `开始为设置项 (ID: "${id}", 类型: "${type}", 标题: "${titleText}") 创建DOM元素。`);

		const itemWrapper = document.createElement('div'); // 包裹每个设置项（含分隔线）
		// itemWrapper.style.borderBottom = '1px solid #e0e0e0'; // 轻微的分隔线，替代hr

		const itemDiv = document.createElement('div'); // 包含标题和控件的行
		Object.assign(itemDiv.style, {
			display: 'flex',
			justifyContent: 'space-between', // 标题和控件两端对齐
			alignItems: 'center', // 垂直居中对齐
			padding: '15px 0', // 上下内边距，左右由父容器控制
			fontSize: '.875rem' // 统一设置项字体大小
		});

		const titleLabel = document.createElement('span');
		titleLabel.textContent = titleText;
		Object.assign(titleLabel.style, {
			flexGrow: '1', // 占据多余空间，将控件推到右侧
			marginRight: '15px', // 与右侧控件的间距
			color: '#222', // 标题文字颜色
			userSelect: 'none' // 防止文本被选中
		});
		itemDiv.appendChild(titleLabel);

		// 根据类型创建不同的控件
		if (type === 'toggle') {
			// 创建一个自定义的拨动开关 (toggle switch)
			const switchLabel = document.createElement('label');
			switchLabel.className = 'custom-toggle-switch'; // 用于可能的全局样式
			Object.assign(switchLabel.style, {
				position: 'relative',
				display: 'inline-block',
				width: '50px', // 开关宽度
				height: '26px', // 开关高度
				flexShrink: '0' // 防止开关被压缩
			});

			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.checked = !!currentSettings[id]; // 根据当前设置初始化状态
			checkbox.id = `aizex-enhancer-chk-${id}`; // 为label关联和直接查找设置ID
			Object.assign(checkbox.style, {
				opacity: '0', // 隐藏原始checkbox
				width: '0',
				height: '0'
			});

			const slider = document.createElement('span'); // 开关的背景/滑块轨道
			slider.className = 'slider'; // 用于样式
			Object.assign(slider.style, {
				position: 'absolute',
				cursor: 'pointer',
				top: '0',
				left: '0',
				right: '0',
				bottom: '0',
				backgroundColor: checkbox.checked ? '#000000' : '#e3e3e3', // 根据状态改变背景色 (黑色为开，灰色为关)
				transition: 'background-color .3s, transform .3s', // 平滑过渡效果
				borderRadius: '26px' // 圆角使轨道变椭圆
			});

			const knob = document.createElement('span'); // 开关的圆形拨钮
			knob.className = 'knob'; // 用于样式
			Object.assign(knob.style, {
				position: 'absolute',
				height: '20px', // 拨钮高度
				width: '20px', // 拨钮宽度
				left: checkbox.checked ? '26px' : '4px', // 根据状态改变位置 (右侧为开，左侧为关)
				bottom: '3px', // 垂直居中拨钮
				backgroundColor: 'white', // 拨钮颜色
				transition: 'transform .3s ease-out, left .3s ease-out', // 平滑过渡效果
				borderRadius: '50%', // 圆形拨钮
				boxShadow: '0 1px 3px rgba(0,0,0,0.2)' // 轻微阴影
			});
			slider.appendChild(knob); // 将拨钮添加到滑块轨道中

			// 事件监听：当checkbox状态改变时 (用户点击开关)
			checkbox.addEventListener('change', async function () {
				const newValue = this.checked;
				log(FN, `设置项 "${titleText}" (ID: ${id}) 的拨动开关状态已更改为: ${newValue}`);
				await saveSetting(id, newValue); // 保存新设置
				// 更新开关UI以反映新状态
				slider.style.backgroundColor = newValue ? '#000000' : '#e3e3e3';
				knob.style.left = newValue ? '26px' : '4px';
			});

			switchLabel.appendChild(checkbox); // 将隐藏的checkbox添加到label
			switchLabel.appendChild(slider); // 将滑块轨道添加到label
			itemDiv.appendChild(switchLabel); // 将整个开关添加到设置项行
		} else if (type === 'file_custom' && id === 'customAvatar') {
			// 为“自定义头像”创建文件选择和重置按钮
			const buttonsContainer = document.createElement('div');
			Object.assign(buttonsContainer.style, {
				display: 'flex',
				alignItems: 'center',
				gap: '10px' // 按钮之间的间距
			});

			const fileInput = document.createElement('input');
			fileInput.type = 'file';
			fileInput.accept = 'image/*'; // 只接受图片文件
			fileInput.id = `aizex-enhancer-file-${id}`;
			fileInput.style.display = 'none'; // 隐藏原始文件输入框

			const selectButton = document.createElement('button');
			selectButton.id = `aizex-enhancer-selbtn-${id}`; // 用于更新按钮文本
			const avatarSetting = currentSettings[id];
			// 根据当前是否已设置头像，更新按钮文本
			selectButton.textContent = (avatarSetting && avatarSetting.isSet && avatarSetting.dataUrl) ?
				CONFIG.TEXT.AVATAR_BTN_SELECTED : CONFIG.TEXT.AVATAR_BTN_SELECT;
			Object.assign(selectButton.style, {
				padding: '6px 12px',
				fontSize: '.8rem',
				cursor: 'pointer',
				border: '1px solid #ccc',
				borderRadius: '4px',
				backgroundColor: '#f0f0f0',
				lineHeight: '1.5' // 确保文本垂直居中
			});
			selectButton.addEventListener('click', () => fileInput.click()); // 点击按钮触发文件选择

			// 文件选择事件
			fileInput.addEventListener('change', async function (event) {
				if (event.target.files && event.target.files[0]) {
					const file = event.target.files[0];
					log(FN, `自定义头像: 用户已选择文件: 名称="${file.name}", 大小=${file.size}字节, 类型="${file.type}"`);
					const reader = new FileReader();
					reader.onload = async function (e) {
						const dataUrl = e.target.result;
						log(FN, `自定义头像: 文件已成功读取为DataURL。DataURL长度: ${dataUrl.length}。`);
						// 简单的大小检查 (例如，5MB Base64约等于 5 * 1.33 MB 原始文件)
						// 注意：DataURL比原始文件大约33%。5MB DataURL 约等于 3.75MB 原始文件。
						if (dataUrl.length > 5 * 1024 * 1024) { // 5MB 限制 (针对DataURL长度)
							const estimatedSizeMB = (dataUrl.length * 0.75 / (1024 * 1024)).toFixed(2); // 估算原始文件大小
							alert(`警告: 您选择的头像文件 (${file.name}) 可能过大 (估算原始大小约 ${estimatedSizeMB}MB)。过大的头像可能会影响性能或加载。建议使用较小的图片。`);
							log(FN, `警告: 用户选择的自定义头像文件大小可能过大 (DataURL长度: ${dataUrl.length})。`);
						}
						// 保存头像设置
						await saveSetting(id, {
							isSet: true,
							originalName: file.name,
							dataUrl: dataUrl
						});
						selectButton.textContent = CONFIG.TEXT.AVATAR_BTN_SELECTED; // 更新按钮文本
						log(FN, '自定义头像已成功保存，选择按钮文本已更新为“已设置头像”。');
					};
					reader.onerror = function () {
						alert('读取头像文件时发生错误，请重试或选择其他文件。');
						log(FN, '自定义头像: FileReader 读取文件时发生错误。');
					};
					reader.readAsDataURL(file); // 将文件读取为DataURL
				}
			});

			const resetButton = document.createElement('button');
			resetButton.textContent = CONFIG.TEXT.AVATAR_BTN_RESET;
			Object.assign(resetButton.style, {
				padding: '6px 12px',
				fontSize: '.8rem',
				cursor: 'pointer',
				border: '1px solid #ccc',
				borderRadius: '4px',
				backgroundColor: '#f0f0f0',
				lineHeight: '1.5'
			});
			resetButton.addEventListener('click', async () => {
				log(FN, '自定义头像: 用户点击了“重置”按钮。');
				fileInput.value = null; // 清空文件输入框（重要，否则再次选择同名文件可能不触发change事件）
				await saveSetting(id, null); // 清除头像设置
				selectButton.textContent = CONFIG.TEXT.AVATAR_BTN_SELECT; // 更新选择按钮文本
				log(FN, '自定义头像已重置，相关设置已清除，选择按钮文本已更新。');
			});

			buttonsContainer.appendChild(selectButton);
			buttonsContainer.appendChild(resetButton);
			itemDiv.appendChild(buttonsContainer);
			itemDiv.appendChild(fileInput); // 隐藏的file input也需要添加到DOM中才能工作
		}
		// (可以扩展其他类型的设置项，如文本输入、下拉选择等)

		itemWrapper.appendChild(itemDiv);

		// 添加分隔线 (在每个设置项下方，除了最后一个)
		// 为了更统一，可以在 settingsContainer 的CSS中用 gap 或 itemWrapper的margin-bottom 实现
		// 这里用hr简单实现，但要注意最后一个元素不应有hr，或hr样式要调整
		const separator = document.createElement('hr');
		Object.assign(separator.style, {
			border: 'none', // 移除默认hr边框
			borderTop: '1px solid #e7e7e7', // 使用细线作为分隔
			margin: '0' // 移除默认hr的上下外边距
		});
		itemWrapper.appendChild(separator);
		// 移除最后一个设置项下方的分隔线，可以在循环结束后处理，或者在创建时判断是否是最后一个。
		// 简单起见，这里每个都加，如果需要精确控制，可以在 createMainSettingsPanel 中循环后移除最后一个hr。

		log(FN, `设置项 (ID: "${id}") 的DOM元素已创建完毕。`);
		return itemWrapper;
	}

	function openMainSettingsPanel() {
		const FN = 'openMainSettingsPanel';
		log(FN, '请求打开主设置面板。');
		let panel = document.getElementById(CONFIG.ELEMENT_IDS.SETTINGS_PANEL);
		let overlay = document.getElementById(CONFIG.ELEMENT_IDS.OVERLAY);

		// 如果面板或遮罩层不存在，则先创建它们
		if (!panel || !overlay) {
			log(FN, '  主设置面板或遮罩层未在DOM中找到。将调用 initializeMainUIElements 尝试重新创建它们。');
			initializeMainUIElements(); // 这会创建面板和遮罩（如果不存在）并尝试注入按钮
			// 重新获取面板和遮罩的引用
			panel = document.getElementById(CONFIG.ELEMENT_IDS.SETTINGS_PANEL);
			overlay = document.getElementById(CONFIG.ELEMENT_IDS.OVERLAY);
			if (!panel || !overlay) {
				log(FN, '  严重错误: 即使在调用 initializeMainUIElements 后，主设置面板或遮罩层仍然无法找到。打开操作中止。');
				return; // 如果创建失败，则无法继续
			}
		}

		// 显示面板和遮罩层
		if (panel) panel.style.display = 'flex'; // 使用flex以应用内部布局
		if (overlay) overlay.style.display = 'block';

		// 禁止页面背景滚动
		if (document.body) document.body.style.overflow = 'hidden';

		// 刷新面板内的控件状态，确保它们反映最新的设置值
		refreshMainSettingsPanelUI();
		log(FN, '主设置面板已成功显示，遮罩层已激活，背景滚动已禁止。面板内控件状态已刷新。');
	}

	function closeMainSettingsPanel() {
		const FN = 'closeMainSettingsPanel';
		log(FN, '请求关闭主设置面板。');
		const panel = document.getElementById(CONFIG.ELEMENT_IDS.SETTINGS_PANEL);
		const overlay = document.getElementById(CONFIG.ELEMENT_IDS.OVERLAY);

		// 隐藏面板和遮罩层
		if (panel) panel.style.display = 'none';
		if (overlay) overlay.style.display = 'none';

		// 恢复页面背景滚动
		if (document.body) document.body.style.overflow = 'auto'; // 或者 'visible'，取决于原始状态

		log(FN, '主设置面板已成功隐藏，遮罩层已禁用，背景滚动已恢复。');
	}

	function toggleMainSettingsPanel() {
		const FN = 'toggleMainSettingsPanel';
		log(FN, '请求切换主设置面板的显示/隐藏状态。');
		let panel = document.getElementById(CONFIG.ELEMENT_IDS.SETTINGS_PANEL);

		// 如果面板不存在 (例如，首次点击按钮时)，则先创建并打开它
		if (!panel) {
			log(FN, '  主设置面板未在DOM中找到。将调用 initializeMainUIElements 创建并随后打开它。');
			initializeMainUIElements(); // 这会创建面板和遮罩
			panel = document.getElementById(CONFIG.ELEMENT_IDS.SETTINGS_PANEL); // 重新获取引用
			if (!panel) {
				log(FN, '  严重错误: 即使在调用 initializeMainUIElements 后，主设置面板仍然无法找到。切换操作中止。');
				return; // 如果创建失败，则无法继续
			}
			// 面板刚创建，肯定是隐藏的，所以直接打开
			openMainSettingsPanel();
			log(FN, '  主设置面板已创建并打开。');
			return;
		}

		// 如果面板已存在，则根据其当前显示状态切换
		if (window.getComputedStyle(panel).display === 'none') {
			log(FN, '  主设置面板当前为隐藏状态，将调用 openMainSettingsPanel 打开它。');
			openMainSettingsPanel();
		} else {
			log(FN, '  主设置面板当前为显示状态，将调用 closeMainSettingsPanel 关闭它。');
			closeMainSettingsPanel();
		}
		log(FN, '主设置面板状态切换完毕。');
	}

	function refreshMainSettingsPanelUI() {
		const FN = 'refreshMainSettingsPanelUI';
		log(FN, '开始刷新主设置面板内各设置项控件的状态，以匹配当前的 currentSettings。');

		// 定义所有需要在面板中更新状态的设置项
		const itemsToRefreshConfig = [{
			id: 'showPoints',
			type: 'toggle'
		}, {
			id: 'hideSidebarEntry',
			type: 'toggle'
		}, {
			id: 'hideScrollToEnd',
			type: 'toggle'
		}, {
			id: 'optimizeUI',
			type: 'toggle'
		}, {
			id: 'enableLogging',
			type: 'toggle'
		}, {
			id: 'customAvatar',
			type: 'file_custom' // 特殊处理自定义头像的UI更新
		}];

		itemsToRefreshConfig.forEach(itemConfig => {
			const settingKey = itemConfig.id;
			const settingValue = currentSettings[settingKey]; // 获取当前设置值

			if (itemConfig.type === 'toggle') {
				// 处理拨动开关 (toggle) 类型的控件
				const checkbox = document.getElementById(`aizex-enhancer-chk-${settingKey}`);
				if (checkbox) {
					const expectedCheckedState = !!settingValue; // 将设置值转为布尔型
					if (checkbox.checked !== expectedCheckedState) {
						checkbox.checked = expectedCheckedState; // 更新checkbox的checked状态
						// 同时更新开关的视觉样式 (背景色和拨钮位置)
						const switchContainer = checkbox.closest('.custom-toggle-switch');
						if (switchContainer) {
							const slider = switchContainer.querySelector('.slider');
							const knob = switchContainer.querySelector('.knob');
							if (slider) slider.style.backgroundColor = expectedCheckedState ? '#000000' : '#e3e3e3';
							if (knob) knob.style.left = expectedCheckedState ? '26px' : '4px';
							log(FN, `  拨动开关 (ID: ${settingKey}) 的UI状态已更新为: ${expectedCheckedState}`);
						} else {
							log(FN, `  警告: 未能找到拨动开关 (ID: ${settingKey}) 的容器 .custom-toggle-switch 进行样式更新。`);
						}
					}
				} else {
					log(FN, `  警告: 未能在面板中找到ID为 "aizex-enhancer-chk-${settingKey}" 的checkbox元素。`);
				}
			} else if (itemConfig.type === 'file_custom' && settingKey === 'customAvatar') {
				// 处理自定义头像 (file_custom) 类型的控件
				const selectButton = document.getElementById(`aizex-enhancer-selbtn-${settingKey}`);
				if (selectButton) {
					const avatarIsSet = (settingValue && settingValue.isSet && settingValue.dataUrl);
					const expectedButtonText = avatarIsSet ? CONFIG.TEXT.AVATAR_BTN_SELECTED : CONFIG.TEXT.AVATAR_BTN_SELECT;
					if (selectButton.textContent !== expectedButtonText) {
						selectButton.textContent = expectedButtonText; // 更新按钮文本
						log(FN, `  自定义头像选择按钮 (ID: ${settingKey}) 的文本已更新为: "${expectedButtonText}"`);
					}
				} else {
					log(FN, `  警告: 未能在面板中找到ID为 "aizex-enhancer-selbtn-${settingKey}" 的自定义头像选择按钮元素。`);
				}
			}
			// 可以扩展其他类型控件的刷新逻辑
		});
		log(FN, '主设置面板内所有控件的状态刷新完毕。');
	}

	function createMainOverlay() {
		const FN = 'createMainOverlay';
		log(FN, '尝试创建主设置面板的背景遮罩层。');
		// 检查遮罩层是否已存在，避免重复创建
		if (document.getElementById(CONFIG.ELEMENT_IDS.OVERLAY)) {
			log(FN, '  背景遮罩层 (ID:', CONFIG.ELEMENT_IDS.OVERLAY, ') 已存在于DOM中。无需重新创建。');
			return; // 如果已存在，则不执行任何操作
		}

		const overlay = document.createElement('div');
		overlay.id = CONFIG.ELEMENT_IDS.OVERLAY;
		Object.assign(overlay.style, {
			display: 'none', // 初始隐藏
			position: 'fixed', // 固定定位，覆盖整个视口
			top: '0',
			left: '0',
			width: '100%',
			height: '100%',
			backgroundColor: 'rgba(0,0,0,0.65)', // 半透明黑色背景
			zIndex: '2147483646' // 确保在面板之下，但在页面内容之上 (比面板zIndex小1)
		});

		// 将创建好的遮罩层添加到文档body中
		if (document.body) {
			document.body.appendChild(overlay);
			log(FN, '  背景遮罩层已成功创建并添加到 document.body。');
		} else {
			log(FN, '  严重错误: document.body 未找到，无法添加背景遮罩层。');
		}
	}

	function addMainGlobalStyles() {
		const FN = 'addMainGlobalStyles';
		log(FN, '开始注入全局CSS样式 (主要用于美化设置面板内的滚动条)。');
		// 为设置面板的可滚动内容区域自定义滚动条样式
		// 这些样式针对 Webkit 浏览器 (Chrome, Safari, Edge) 和 Firefox
		GM_addStyle(`
			/* Webkit Scrollbar Styles */
			#${CONFIG.ELEMENT_IDS.SCROLLABLE_CONTENT_AREA}::-webkit-scrollbar {
				width: 8px; /* 滚动条宽度 */
				background-color: transparent; /* 滚动条轨道背景透明 */
			}
			#${CONFIG.ELEMENT_IDS.SCROLLABLE_CONTENT_AREA}::-webkit-scrollbar-track {
				background-color: transparent; /* 轨道背景透明 */
				border-radius: 4px; /* 轨道圆角 */
				margin-block: 2px; /* 上下留出一点边距 */
			}
			#${CONFIG.ELEMENT_IDS.SCROLLABLE_CONTENT_AREA}::-webkit-scrollbar-thumb {
				background-color: #ccc; /* 滑块颜色 (较浅的灰色) */
				border-radius: 4px; /* 滑块圆角 */
				border: 2px solid #f9f9f9; /* 滑块边框，颜色与面板背景一致，产生内嵌效果 */
			}
			#${CONFIG.ELEMENT_IDS.SCROLLABLE_CONTENT_AREA}::-webkit-scrollbar-thumb:hover {
				background-color: #aaa; /* 鼠标悬停时滑块颜色变深 */
				border-color: #f0f0f0; /* 悬停时边框颜色微调 (可选) */
			}
			#${CONFIG.ELEMENT_IDS.SCROLLABLE_CONTENT_AREA}::-webkit-scrollbar-button {
				display: none; /* 隐藏滚动条两端的按钮 */
			}

			/* Firefox Scrollbar Styles */
			#${CONFIG.ELEMENT_IDS.SCROLLABLE_CONTENT_AREA} {
				scrollbar-width: thin; /* Firefox: 使用细滚动条 */
				scrollbar-color: #ccc #f9f9f9; /* Firefox: 滑块颜色 和 轨道颜色 */
			}
		`);
		log(FN, '全局CSS样式已成功注入。');
	}

	function initializeMainUIElements() {
		const FN = 'initializeMainUIElements';
		log(FN, '开始初始化主UI元素：创建遮罩层、设置面板，并尝试注入“高级设置”按钮。');
		createMainOverlay(); // 创建背景遮罩层 (如果不存在)
		if (!document.getElementById(CONFIG.ELEMENT_IDS.SETTINGS_PANEL)) {
			createMainSettingsPanel(); // 创建主设置面板 (如果不存在)
		} else {
			refreshMainSettingsPanelUI(); // 如果面板已存在，则刷新其内部控件状态
		}
		attemptAdvancedButtonInsertion(); // 尝试将“高级设置”按钮注入到目标位置
		log(FN, '主UI元素初始化完毕。');
	}

	function attemptAdvancedButtonInsertion() {
		const FN = 'attemptAdvancedButtonInsertion';
		log(FN, '开始尝试将“高级设置”按钮注入到目标容器中。');
		const targetContainer = document.querySelector(CONFIG.SELECTORS.ADVANCED_SETTINGS_BUTTON_TARGET_CONTAINER);

		if (targetContainer) {
			log(FN, '  成功找到“高级设置”按钮的目标注入容器:', targetContainer);
			// 目标容器已找到，如果观察器在运行，现在可以停止它，因为任务已完成。
			if (mainSettingsButtonObserver) {
				mainSettingsButtonObserver.disconnect();
				mainSettingsButtonObserver = null;
				log(FN, '    目标容器已找到，mainSettingsButtonObserver 已停止。');
			}

			// 检查按钮是否已存在于DOM中
			if (!document.getElementById(CONFIG.ELEMENT_IDS.ADVANCED_SETTINGS_BUTTON)) {
				log(FN, '  “高级设置”按钮当前不在DOM中，将创建并注入。');
				const advancedButton = createAdvancedSettingsButton(); // 创建按钮
				if (advancedButton) {
					// 将按钮插入到目标容器的起始位置 (作为第一个子元素)
					targetContainer.insertBefore(advancedButton, targetContainer.firstChild);
					log(FN, '  “高级设置”按钮已成功注入到目标容器的起始位置。');
				} else {
					log(FN, '  错误: createAdvancedSettingsButton未能成功返回按钮元素，注入失败。');
				}
			} else {
				log(FN, '  “高级设置”按钮 (ID:', CONFIG.ELEMENT_IDS.ADVANCED_SETTINGS_BUTTON, ') 已存在于DOM中，无需重新注入。');
			}
		} else {
			log(FN, '  当前DOM中未找到“高级设置”按钮的目标注入容器 (选择器:', CONFIG.SELECTORS.ADVANCED_SETTINGS_BUTTON_TARGET_CONTAINER, ')。');
			// 如果目标容器未找到，且观察器未运行，则启动观察器
			// 注意：这里不检查特定功能是否激活，因为“高级设置”按钮是核心UI，应始终尝试显示
			if (!mainSettingsButtonObserver) {
				log(FN, '  当前没有活动的 mainSettingsButtonObserver。将创建并启动一个新的 MutationObserver 等待目标容器出现。');
				mainSettingsButtonObserver = new MutationObserver((mutationsList, obs) => {
					// log(FN, 'mainSettingsButtonObserver: MutationObserver 回调被触发。');
					// 检查目标容器是否已出现
					if (document.querySelector(CONFIG.SELECTORS.ADVANCED_SETTINGS_BUTTON_TARGET_CONTAINER)) {
						log(FN, '  mainSettingsButtonObserver 回调：成功检测到目标注入容器已出现在DOM中！将再次调用 attemptAdvancedButtonInsertion。');
						attemptAdvancedButtonInsertion(); // 重新尝试注入
						// attemptAdvancedButtonInsertion 内部会在成功找到目标后停止此观察器
					}
				});
				try {
					mainSettingsButtonObserver.observe(document.documentElement, {
						childList: true,
						subtree: true
					});
					log(FN, '  mainSettingsButtonObserver 已成功启动，正在监视整个文档的DOM变化以查找注入目标容器。');
				} catch (e) {
					log(FN, '  严重错误: mainSettingsButtonObserver 启动失败:', e);
					mainSettingsButtonObserver = null;
				}
			} else {
				log(FN, '  mainSettingsButtonObserver 已在运行中，将继续等待目标注入容器出现。');
			}
		}
		log(FN, '执行完毕。');
	}
	let mainUrlCheckIntervalId = null; // 用于存储URL变化检测的setInterval ID

	function startMainURLChangeDetector() {
		const FN = 'startMainURLChangeDetector';
		log(FN, '尝试启动URL变化检测器。');
		if (mainUrlCheckIntervalId !== null) {
			log(FN, '  URL变化检测器 (ID:', mainUrlCheckIntervalId, ') 已在运行中。无需重复启动。');
			return;
		}
		// 每秒检查一次URL是否发生变化
		mainUrlCheckIntervalId = setInterval(checkMainURLChange, 1000);
		log(FN, `  URL变化检测器已成功启动 (setInterval ID: ${mainUrlCheckIntervalId})，检测间隔: 1000ms。`);
	}

	function checkMainURLChange() {
		const FN = 'checkMainURLChange'; // 日志用函数名
		const currentUrl = window.location.href; // 获取当前浏览器地址栏的URL

		// 如果当前URL与上次记录的URL不同，则认为发生了URL变化
		if (currentUrl !== previousUrl) {
			log(FN, `检测到浏览器URL发生变化!`);
			log(FN, `  旧URL: "${previousUrl}"`);
			log(FN, `  新URL: "${currentUrl}"`);
			previousUrl = currentUrl; // 更新记录的URL为当前URL

			log(FN, '  由于URL发生变化，将重新应用各项功能和UI元素的状态...');

			// 1. 重新尝试注入“高级设置”按钮 (以防页面结构变化导致按钮丢失)
			attemptAdvancedButtonInsertion();

			// 2. 根据各项功能的激活状态，重新应用其效果
			if (isPointsDisplayFeatureActive) {
				log(FN, '    URL变化后，重新检查并注入积分面板 (如果需要)，并获取最新积分数据。');
				attemptQuotaPanelInsertion(); // 确保积分面板在正确位置
				fetchQuotaData('URL发生变化'); // 获取最新积分
			}
			if (isHideSidebarEntryFeatureActive) {
				log(FN, '    URL变化后，重新应用隐藏侧边栏的逻辑。');
				toggleHideSidebarEntryFeature(true); // 确保隐藏侧边栏的样式存在
			}
			if (isHideScrollToEndButtonFeatureActive) {
				log(FN, '    URL变化后，重新管理“滚动至末尾”按钮的可见性。');
				manageScrollToEndButtonVisibility(); // 确保按钮按设置隐藏
			}
			if (isOptimizeUIFeatureActive) {
				log(FN, '    URL变化后，重新执行界面优化逻辑。');
				manageOptimizeUITarget(); // 确保目标元素按设置被处理
			}
			if (currentSettings.customAvatar && currentSettings.customAvatar.dataUrl) {
				log(FN, '    URL变化后，重新应用自定义头像。');
				applyCustomAvatarToPage(); // 确保头像被正确应用
			}

			// 3. 如果主设置面板在URL变化时是打开状态，则自动关闭它
			// 这是为了防止面板在页面内容变化后显得错位或不适用
			const settingsPanel = document.getElementById(CONFIG.ELEMENT_IDS.SETTINGS_PANEL);
			if (settingsPanel && window.getComputedStyle(settingsPanel).display !== 'none') {
				log(FN, '  检测到主设置面板在URL变化时为打开状态，将自动调用 closeMainSettingsPanel 关闭它。');
				closeMainSettingsPanel();
			}
			log(FN, '  URL变化后的功能和UI状态重应用已完成。');
		}
		// 如果URL未变化，则不执行任何操作 (此函数会由setInterval周期性调用)
	}

	// --- 脚本执行入口 (Main Execution Block) ---
	async function main() {
		const FN = 'main'; // 主函数名，用于日志
		// 输出脚本启动信息，包括版本号
		const scriptInfo = typeof GM_info !== 'undefined' ? GM_info.script : {
			version: CONFIG.SCRIPT_VERSION,
			name: CONFIG.SCRIPT_NAME
		}; // 兼容GM_info可能不存在的情况
		console.log(`[${scriptInfo.name}] ${new Date().toLocaleString()}: 脚本开始执行 (版本: ${scriptInfo.version})。`);

		// 步骤1: 异步加载用户设置。这是首要任务，因为后续很多行为依赖于设置。
		await loadSettings();
		log(FN, `主函数 (main) 已开始执行。用户设置已成功加载。`);
		log(FN, `  当前日志输出功能状态 (enableLogging): ${currentSettings.enableLogging}`);
		log(FN, `  详细设置状态: 积分显示(showPoints):${currentSettings.showPoints}, 隐藏侧边栏(hideSidebarEntry):${currentSettings.hideSidebarEntry}, 隐藏滚动末尾按钮(hideScrollToEnd):${currentSettings.hideScrollToEnd}, 优化UI(optimizeUI):${currentSettings.optimizeUI}, 自定义头像(customAvatar):${!!(currentSettings.customAvatar && currentSettings.customAvatar.dataUrl)}`);

		// 步骤2: 注入全局CSS样式 (例如，美化设置面板的滚动条)
		log(FN, '调用 addMainGlobalStyles 函数以注入全局CSS样式...');
		addMainGlobalStyles();

		// 步骤3: 根据文档加载状态，决定何时执行核心初始化逻辑
		const documentReadyState = document.readyState;
		log(FN, `当前 document.readyState 为: "${documentReadyState}"`);

		// 定义一个统一的初始化函数，用于在DOM就绪后执行
		const initializeCoreFunctionality = () => {
			const ICF_FN = 'initializeCoreFunctionality'; // 此函数名用于日志
			log(ICF_FN, 'DOM已就绪或已加载完成。开始执行脚本的核心初始化逻辑...');

			// 初始化主UI元素 (高级设置按钮、设置面板、遮罩层等)
			log(ICF_FN, '  调用 initializeMainUIElements 初始化主UI元素...');
			initializeMainUIElements();

			// 启动URL变化检测器，以应对单页应用 (SPA) 的路由变化
			log(ICF_FN, '  调用 startMainURLChangeDetector 启动URL变化检测器...');
			startMainURLChangeDetector();

			// 根据已加载的设置，初始化所有独立功能模块的状态
			// 这个函数会调用各个 toggleXXXFeature 函数，传入当前设置值
			log(ICF_FN, '  调用 initializeAllFeatureStates 根据已加载的设置初始化各功能模块的激活状态...');
			initializeAllFeatureStates();

			log(ICF_FN, '脚本核心UI初始化、URL变化检测器启动以及所有功能模块的状态设置已成功完成。');
		};

		// 根据文档加载状态选择执行时机
		if (documentReadyState === 'loading') {
			// 如果文档仍在加载中，则等待 DOMContentLoaded 事件触发后再执行核心初始化
			log(FN, '文档仍在加载中 (readyState === "loading")。将添加 "DOMContentLoaded" 事件监听器，在DOM完全构建并解析后执行核心初始化。');
			document.addEventListener('DOMContentLoaded', () => {
				const DCL_FN = 'DOMContentLoaded_Callback'; // 回调函数名用于日志
				log(DCL_FN, '"DOMContentLoaded" 事件已触发。脚本将开始执行核心初始化逻辑。');
				initializeCoreFunctionality(); // 执行核心初始化
			});
		} else {
			// 如果文档已加载完成 (interactive 或 complete 状态)，则立即执行核心初始化
			log(FN, '文档已加载完成或处于 interactive/complete 状态。将立即执行核心初始化逻辑。');
			initializeCoreFunctionality(); // 执行核心初始化
		}

		log(FN, '主函数 (main) 的同步部分执行接近尾声。脚本现在将主要由事件监听器 (如DOM变化、URL变化、用户交互) 和定时器 (如积分自动刷新) 驱动。');
	}

	/**
	 * @description 根据当前加载的设置 (currentSettings)，初始化所有独立功能模块的激活状态。
	 * 此函数会在脚本启动时，DOM就绪后被调用一次。
	 */
	function initializeAllFeatureStates() {
		const FN = 'initializeAllFeatureStates';
		log(FN, '开始根据当前已加载的用户设置，统一初始化所有独立功能模块的初始激活状态...');

		// 为每个功能调用其对应的切换函数，传入从设置中读取的布尔值
		log(FN, `  初始化“积分显示”功能状态为: ${currentSettings.showPoints}`);
		togglePointsDisplayFeature(currentSettings.showPoints);

		log(FN, `  初始化“隐藏侧边工具栏入口”功能状态为: ${currentSettings.hideSidebarEntry}`);
		toggleHideSidebarEntryFeature(currentSettings.hideSidebarEntry);

		log(FN, `  初始化“隐藏滚动至末尾按钮”功能状态为: ${currentSettings.hideScrollToEnd}`);
		toggleHideScrollToEndButtonFeature(currentSettings.hideScrollToEnd);

		log(FN, `  初始化“优化界面”功能状态为: ${currentSettings.optimizeUI}`);
		toggleOptimizeUIFeature(currentSettings.optimizeUI);

		// 自定义头像功能有其特殊的初始化逻辑，不只是简单的布尔切换
		log(FN, `  初始化“自定义头像”功能状态 (基于是否存在有效头像数据)...`);
		initializeCustomAvatarState(); // 此函数会检查 currentSettings.customAvatar 并应用或恢复头像

		log(FN, '所有独立功能模块的初始激活状态已根据设置初始化完成。');
	}


	// 启动脚本主逻辑。使用 try...catch 块捕获任何在 main 函数调用栈之外发生的顶层未处理异常。
	try {
		main(); // 调用主函数开始执行脚本
	} catch (error) {
		// 记录任何未被捕获的顶层错误，这通常指示脚本初始化阶段的严重问题
		const errorTimestamp = new Date().toLocaleString();
		const scriptNameForError = typeof GM_info !== 'undefined' ? GM_info.script.name : CONFIG.SCRIPT_NAME;
		const scriptVersionForError = typeof GM_info !== 'undefined' ? GM_info.script.version : CONFIG.SCRIPT_VERSION;

		console.error(`[${scriptNameForError} v${scriptVersionForError}] ${errorTimestamp}: 脚本在顶层执行 (main函数调用栈之外或其内部未捕获的严重错误) 时捕获到异常:`, error);
		// 尝试使用脚本的 log 函数记录错误，但这依赖于 currentSettings.enableLogging 是否已正确加载和设置。
		// 如果 loadSettings 本身失败，currentSettings 可能仍然是初始的 {enableLogging: false}，导致此 log 不会输出。
		log('TOP_LEVEL_CATCH_BLOCK', `脚本顶层捕获到严重错误。错误信息: "${error.message}". 错误堆栈:`, error.stack || '(无可用堆栈信息)');
		// 也可以考虑在此处弹出一个 alert 提示用户脚本发生严重错误，但这可能会打扰用户。
		// alert(`${scriptNameForError} 发生了一个严重错误，部分功能可能无法正常工作。请检查浏览器控制台获取详细信息。`);
	}

})();