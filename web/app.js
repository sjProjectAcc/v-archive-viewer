const state = {
  payload: null,
  comparePayload: null,
  floorMinImageRows: [],
  floorMinImageRecords: [],
  buttonTop50BaseMax: null,
  floorPatternCounts: null,
  view: "chart",
  chartMetric: "score",
  chartYMinByMetric: {},
  chartYMinAutoByMetric: {},
  chartYMaxByMetric: {},
  chartYMaxAutoByMetric: {},
  chartXRangeByMode: {},
  chartXMode: "floor",
  compareChartMetric: "score",
  compareChartRanges: {},
  historyEntries: [],
  historyRows: [],
  achievementRows: [],
  achievementSelected: new Set(),
  achievementRenderToken: 0,
  selfCompareRows: [],
  selfCompareRenderToken: 0,
  historyCollecting: false,
  historyStopRequested: false,
  historyRenderToken: 0,
  historyAccountNickname: "",
  historyPendingAccount: null,
  tagsRows: [],
  tagsSelected: new Set(),
  tagsUpdatedAt: 0,
  tagsLoading: false,
  tagsLoadError: "",
  sortKey: null,
  sortDir: "asc",
};

const floorLabels = Array.from({ length: 17 }, (_, n) => [1, 2, 3].map((m) => `${n + 1}.${m}`)).flat();
const SETTINGS_KEY = "vArchiveViewerSettings";
const NICKNAME_HISTORY_KEY = "vArchiveNicknameHistory";
const HISTORY_ACCOUNT_NICKNAME_KEY = "vArchiveHistoryAccountNickname";
const DEFAULT_NICKNAME = "lemoncube7";
const API_BASE_URL = "https://v-archive.net";
const SONG_DB_URL = `${API_BASE_URL}/db/v2/songs.json`;
const BUTTONS = [4, 5, 6, 8];
const MAX_ACHIEVEMENT_COLUMNS = 12;
const CHART_DOT_EDGE_INSET = 6.5;
const HISTORY_REQUEST_DELAY_START = 900;
const HISTORY_REQUEST_DELAY_MIN = 150;
const HISTORY_REQUEST_DELAY_MAX = 6000;
const DB_NAME = "vArchiveViewerCache";
const DB_VERSION = 2;
const PROFILE_STORE = "profiles";
const HISTORY_STORE = "recordHistories";
const SCORE_BASE = Math.pow(30, 1 / 10);
const ANCHOR_FLOOR_LABEL = "15.2";
const ANCHOR_DIFFICULTY_CONSTANT = 10;
const FLOOR_STEP_RATIO = 10 / 9;
const TARGET_TOP50_MAX = 5000;
const TOP50_SCALE_CACHE_KEY = "vArchiveTop50ScaleCache0900";
const TOP50_SCALE_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
const TAGS_API_URL = "https://fjwuuodmtttqohxsycvp.supabase.co/rest/v1/song_tags_2?select=song_title%2Ctags%2Caka&limit=1000";
const TAGS_ABILITY_API_URL = "https://fjwuuodmtttqohxsycvp.supabase.co/rest/v1/ability?select=id%2Cability_set&order=id";
const TAGS_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqd3V1b2RtdHR0cW9oeHN5Y3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDkwNjYsImV4cCI6MjA3MDcyNTA2Nn0.FItZtjt2v2otOUnmDtqhKG4IrPD4FjaRc_tVy-nxpsI";
const TAGS_CACHE_KEY = "vArchiveSongTagsCacheV4";
const TAGS_CACHE_SCHEMA_VERSION = 4;
const TAGS_CACHE_TTL = 24 * 60 * 60 * 1000;
const FALLBACK_BUTTON_TOP50_BASE_MAX = Object.freeze({
  4: 4166.31349894268,
  5: 3980.45017878281,
  6: 4160.22135542487,
  8: 4304.77927419081,
});
const TOP_IMAGE_COLUMNS = 5;
const TOP_IMAGE_ROWS = 6;
const TOP_IMAGE_COUNT = TOP_IMAGE_COLUMNS * TOP_IMAGE_ROWS;

const columns = {
  top100: [
    ["button", "button"],
    ["rank", "rank"],
    ["logPower", "logPower"],
    ["floorMaxPoint", "floorMax"],
    ["name", "name"],
    ["pattern", "pattern"],
    ["level", "level"],
    ["floorName", "floor"],
    ["score", "score"],
    ["maxCombo", "maxCombo"],
    ["updatedAt", "updatedAt"],
  ],
  records: [
    ["button", "button"],
    ["name", "name"],
    ["pattern", "pattern"],
    ["level", "level"],
    ["floor", "floor"],
    ["score", "score"],
    ["rating", "rating"],
    ["maxRating", "maxRating"],
    ["djpower", "djpower"],
    ["maxDjpower", "maxDjpower"],
    ["updatedAt", "updatedAt"],
  ],
  history: [
    ["button", "button"],
    ["name", "name"],
    ["pattern", "pattern"],
    ["level", "level"],
    ["floorName", "floor"],
    ["score", "score"],
    ["maxCombo", "maxCombo"],
    ["logPower", "logPower"],
    ["updatedAt", "updatedAt"],
  ],
  selfCompare: [
    ["button", "button"],
    ["name", "name"],
    ["pattern", "pattern"],
    ["level", "level"],
    ["floorName", "floor"],
    ["previousScore", "previous score"],
    ["currentScore", "current score"],
    ["scoreDiff", "score diff"],
    ["previousLogPower", "previous logPower"],
    ["currentLogPower", "current logPower"],
    ["logPowerDiff", "logPower diff"],
    ["previousUpdatedAt", "previous updatedAt"],
    ["currentUpdatedAt", "current updatedAt"],
  ],
  floorMinScore: [
    ["button", "button"],
    ["floor", "floor"],
    ["score", "score"],
    ["name", "name"],
    ["pattern", "pattern"],
    ["level", "level"],
    ["updatedAt", "updatedAt"],
  ],
  tiers: [
    ["button", "button"],
    ["top50sum", "top50sum"],
    ["tierPoint", "tierPoint"],
    ["tierName", "tierName"],
    ["nextRating", "nextRating"],
    ["nextTierName", "nextTierName"],
  ],
  djClasses: [
    ["button", "button"],
    ["djPowerSum", "djPowerSum"],
    ["djPowerConversion", "djPowerConversion"],
    ["maxDjPower", "maxDjPower"],
    ["djClass", "djClass"],
  ],
  errors: [
    ["category", "category"],
    ["button", "button"],
    ["status", "status"],
    ["message", "message"],
    ["url", "url"],
  ],
  compare: [
    ["button", "button"],
    ["name", "name"],
    ["pattern", "pattern"],
    ["level", "level"],
    ["floorName", "floor"],
    ["mineScore", "my score"],
    ["otherScore", "other score"],
    ["scoreDiff", "score diff"],
    ["mineZ", "my z"],
    ["otherZ", "other z"],
    ["zDiff", "z diff"],
    ["mineLogPower", "my logPower"],
    ["otherLogPower", "other logPower"],
    ["logPowerDiff", "logPower diff"],
    ["minePoint", "my Point"],
    ["otherPoint", "other Point"],
    ["pointDiff", "Point diff"],
    ["result", "result"],
    ["mineUpdatedAt", "my updatedAt"],
    ["otherUpdatedAt", "other updatedAt"],
  ],
};

const statusText = document.querySelector("#statusText");
const summaryEl = document.querySelector("#summary");
const tableSection = document.querySelector("#tableSection");
const tableSummary = document.querySelector("#tableSummary");
const tableEl = document.querySelector("#dataTable");
const chartPanel = document.querySelector("#chartPanel");
const chartTooltip = document.querySelector("#chartTooltip");
const compareChartPanel = document.querySelector("#compareChartPanel");
const compareChartTitle = document.querySelector("#compareChartTitle");
const compareChartDescription = document.querySelector("#compareChartDescription");
const compareChartModeSelect = document.querySelector("#compareChartModeSelect");
const compareChartMetricSelect = document.querySelector("#compareChartMetricSelect");
const compareChartMinInput = document.querySelector("#compareChartMinInput");
const compareChartMaxInput = document.querySelector("#compareChartMaxInput");
const compareChartAutoInput = document.querySelector("#compareChartAutoInput");
const compareChartImageButton = document.querySelector("#compareChartImageButton");
const compareScatterChart = document.querySelector("#compareScatterChart");
const compareChartTooltip = document.querySelector("#compareChartTooltip");
const historyPanel = document.querySelector("#historyPanel");
const historyStatus = document.querySelector("#historyStatus");
const historyCollectButton = document.querySelector("#historyCollectButton");
const historyFullCollectButton = document.querySelector("#historyFullCollectButton");
const historyResetButton = document.querySelector("#historyResetButton");
const historyStopButton = document.querySelector("#historyStopButton");
const historyProgress = document.querySelector("#historyProgress");
const historyProgressBar = document.querySelector("#historyProgressBar");
const historyLogPowerChart = document.querySelector("#historyLogPowerChart");
const historyTooltip = document.querySelector("#historyTooltip");
const historyLegend = document.querySelector("#historyLegend");
const historyImageButton = document.querySelector("#historyImageButton");
const historyAccountUserNo = document.querySelector("#historyAccountUserNo");
const historyAccountToken = document.querySelector("#historyAccountToken");
const historyAccountLoginButton = document.querySelector("#historyAccountLoginButton");
const historyAccountFileButton = document.querySelector("#historyAccountFileButton");
const historyAccountStatus = document.querySelector("#historyAccountStatus");
const historyStartDate = document.querySelector("#historyStartDate");
const historyEndDate = document.querySelector("#historyEndDate");
const historyRangeResetButton = document.querySelector("#historyRangeResetButton");
const achievementPanel = document.querySelector("#achievementPanel");
const achievementStatus = document.querySelector("#achievementStatus");
const achievementSelectVisibleButton = document.querySelector("#achievementSelectVisibleButton");
const achievementClearButton = document.querySelector("#achievementClearButton");
const achievementImageButton = document.querySelector("#achievementImageButton");
const achievementColumnsInput = document.querySelector("#achievementColumnsInput");
const achievementAutoLogPowerInput = document.querySelector("#achievementAutoLogPowerInput");
const achievementAutoHoursInput = document.querySelector("#achievementAutoHoursInput");
const achievementAutoSelectButton = document.querySelector("#achievementAutoSelectButton");
const achievementSelectionSummary = document.querySelector("#achievementSelectionSummary");
const achievementList = document.querySelector("#achievementList");
const selfComparePanel = document.querySelector("#selfComparePanel");
const selfCompareStatus = document.querySelector("#selfCompareStatus");
const selfCompareStart = document.querySelector("#selfCompareStart");
const selfCompareEnd = document.querySelector("#selfCompareEnd");
const selfCompareNowButton = document.querySelector("#selfCompareNowButton");
const tagsPanel = document.querySelector("#tagsPanel");
const tagsStatus = document.querySelector("#tagsStatus");
const tagsRefreshButton = document.querySelector("#tagsRefreshButton");
const tagsClearButton = document.querySelector("#tagsClearButton");
const tagsGenreSelect = document.querySelector("#tagsGenreSelect");
const tagsBpmMinInput = document.querySelector("#tagsBpmMinInput");
const tagsBpmMaxInput = document.querySelector("#tagsBpmMaxInput");
const tagsRecordModeSelect = document.querySelector("#tagsRecordModeSelect");
const tagsWeightSelect = document.querySelector("#tagsWeightSelect");
const tagsPatternOnlyInput = document.querySelector("#tagsPatternOnlyInput");
const tagsScPatternOnlyInput = document.querySelector("#tagsScPatternOnlyInput");
const tagsMatchModeSelect = document.querySelector("#tagsMatchModeSelect");
const tagsSortSelect = document.querySelector("#tagsSortSelect");
const tagsFacetSearchInput = document.querySelector("#tagsFacetSearchInput");
const tagsSelectedSummary = document.querySelector("#tagsSelectedSummary");
const tagsFacetList = document.querySelector("#tagsFacetList");
const tagsResultSummary = document.querySelector("#tagsResultSummary");
const tagsTable = document.querySelector("#tagsTable");
const debugPanel = document.querySelector("#debugPanel");
const debugRatioInput = document.querySelector("#debugRatioInput");
const debugRatioRange = document.querySelector("#debugRatioRange");
const debugRatioResetButton = document.querySelector("#debugRatioResetButton");
const debugRatioEquation = document.querySelector("#debugRatioEquation");
const debugSummary = document.querySelector("#debugSummary");
const debugScatterChart = document.querySelector("#debugScatterChart");
const debugChartTooltip = document.querySelector("#debugChartTooltip");
const debugFloorMaxLegend = document.querySelector("#debugFloorMaxLegend");
const debugFloorTable = document.querySelector("#debugFloorTable");
const readmePanel = document.querySelector("#readmePanel");
const overviewPanel = document.querySelector("#overviewPanel");
const overviewTierTable = document.querySelector("#overviewTierTable");
const overviewDjClassTable = document.querySelector("#overviewDjClassTable");
const nativeOnlyEls = document.querySelectorAll(".nativeOnly");
const webOnlyEls = document.querySelectorAll(".webOnly");
const desktopOnlyEls = document.querySelectorAll(".desktopOnly");
const appVersionEl = document.querySelector("#appVersion");
const desktopUpdateCheckButton = document.querySelector("#desktopUpdateCheckButton");
const desktopUpdateButton = document.querySelector("#desktopUpdateButton");
const themeToggleButton = document.querySelector("#themeToggleButton");
const installAppButton = document.querySelector("#installAppButton");
const nicknameInput = document.querySelector("#nicknameInput");
const nicknameApplyButton = document.querySelector("#nicknameApplyButton");
const recentNicknamesEl = document.querySelector("#recentNicknames");
const refreshButton = document.querySelector("#refreshButton");
const fullRefreshButton = document.querySelector("#fullRefreshButton");
const viewSelect = document.querySelector("#viewSelect");
const buttonFilter = document.querySelector("#buttonFilter");
const patternFilter = document.querySelector("#patternFilter");
const searchInput = document.querySelector("#searchInput");
const limitSelect = document.querySelector("#limitSelect");
const nameWidthInput = document.querySelector("#nameWidthInput");
const recordsFloorMinSelect = document.querySelector("#recordsFloorMinSelect");
const recordsFloorMaxSelect = document.querySelector("#recordsFloorMaxSelect");
const recordsOnlyEls = document.querySelectorAll(".recordsOnly");
const compareNicknameInput = document.querySelector("#compareNicknameInput");
const compareLoadButton = document.querySelector("#compareLoadButton");
const compareModeSelect = document.querySelector("#compareModeSelect");
const compareSortSelect = document.querySelector("#compareSortSelect");
const compareMinZSelect = document.querySelector("#compareMinZSelect");
const compareFloorMinSelect = document.querySelector("#compareFloorMinSelect");
const compareFloorMaxSelect = document.querySelector("#compareFloorMaxSelect");
const compareStdFloorSelect = document.querySelector("#compareStdFloorSelect");
const compareOnlyEls = document.querySelectorAll(".compareOnly");
const chartMetricSelect = document.querySelector("#chartMetricSelect");
const chartTitle = document.querySelector("#chartTitle");
const chartDescription = document.querySelector("#chartDescription");
const xMinLabel = document.querySelector("#xMinLabel");
const xMaxLabel = document.querySelector("#xMaxLabel");
const xMinSelect = document.querySelector("#xMinSelect");
const xMaxSelect = document.querySelector("#xMaxSelect");
const yMinInput = document.querySelector("#yMinInput");
const yMinAutoInput = document.querySelector("#yMinAutoInput");
const yMaxInput = document.querySelector("#yMaxInput");
const yMaxAutoInput = document.querySelector("#yMaxAutoInput");
const chartFloorMaxLegend = document.querySelector("#chartFloorMaxLegend");
const chartBelowLegend = document.querySelector("#chartBelowLegend");
const chartTop50Legend = document.querySelector("#chartTop50Legend");
const chartFloorMaxLegendText = document.querySelector("#chartFloorMaxLegendText");
const chartMaxLegend = document.querySelector("#chartMaxLegend");
const chartAvgLegend = document.querySelector("#chartAvgLegend");
const chartMinLegend = document.querySelector("#chartMinLegend");
const chartImageButton = document.querySelector("#chartImageButton");
const chartEl = document.querySelector("#floorScoreChart");
let achievementDragActive = false;
let achievementDragValue = true;
let achievementSuppressClick = false;

const UI_SCHEMA_VERSION = "achievement-auto-select-v1";
const REQUIRED_UI_IDS = [
  "statusText",
  "chartPanel",
  "compareChartPanel",
  "historyPanel",
  "achievementPanel",
  "achievementAutoLogPowerInput",
  "achievementAutoHoursInput",
  "achievementAutoSelectButton",
  "selfComparePanel",
  "tagsPanel",
  "debugPanel",
  "readmePanel",
  "overviewPanel",
  "tableSection",
];

window.addEventListener("load", () => {
  if (!ensureUiSchema()) return;
  renderAppVersion();
  initMobileEnvironment();
  initPwa();
  initDesktopBridge();
  initFloorSelectors();
  wireEvents();
  loadTop50ScaleCache();
  refresh(false);
});

function ensureUiSchema() {
  const missing = REQUIRED_UI_IDS.filter((id) => !document.getElementById(id));
  if (!missing.length) {
    sessionStorage.removeItem("vArchiveUiSchemaRepair");
    return true;
  }

  const isDesktop = Boolean(window.__TAURI__?.core?.invoke);
  const repairedSchema = sessionStorage.getItem("vArchiveUiSchemaRepair");
  if (isDesktop && repairedSchema !== UI_SCHEMA_VERSION) {
    sessionStorage.setItem("vArchiveUiSchemaRepair", UI_SCHEMA_VERSION);
    if (statusText) statusText.textContent = "업데이트된 화면을 다시 불러오는 중입니다...";
    const url = new URL(location.href);
    url.searchParams.set("ui-schema", UI_SCHEMA_VERSION);
    location.replace(url.toString());
    return false;
  }

  if (statusText) statusText.textContent = `화면 파일 버전 오류: ${missing.map((id) => `#${id}`).join(", ")}`;
  return false;
}

function initMobileEnvironment() {
  const compactPointer = window.matchMedia("(pointer: coarse) and (max-width: 1024px)");
  const update = () => {
    const userAgentMobile = navigator.userAgentData?.mobile === true
      || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    document.documentElement.classList.toggle("mobileEnvironment", userAgentMobile || compactPointer.matches);
  };
  update();
  compactPointer.addEventListener?.("change", update);
}

let deferredInstallPrompt = null;

function initPwa() {
  if (!/^https?:$/.test(location.protocol)) return;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installAppButton.hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    installAppButton.hidden = true;
  });
  installAppButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    installAppButton.disabled = true;
    try {
      await deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
    } finally {
      deferredInstallPrompt = null;
      installAppButton.hidden = true;
      installAppButton.disabled = false;
    }
  });
  if ("serviceWorker" in navigator) {
    const version = document.querySelector('meta[name="v-archive-version"]')?.content || "dev";
    navigator.serviceWorker.register(`./sw.js?v=${encodeURIComponent(version)}`, { updateViaCache: "none" }).catch(() => {});
  }
}

function renderAppVersion() {
  const version = document.querySelector('meta[name="v-archive-version"]')?.content;
  appVersionEl.textContent = version ? `v${version}` : "local";
  appVersionEl.title = version ? `배포 버전 ${version}` : "로컬 버전";
}

async function initDesktopBridge() {
  const isDesktop = Boolean(window.__TAURI__?.core?.invoke);
  nativeOnlyEls.forEach((el) => {
    el.hidden = !isDesktop;
  });
  webOnlyEls.forEach((el) => {
    el.hidden = isDesktop;
  });
  desktopOnlyEls.forEach((el) => {
    el.hidden = !isDesktop;
    el.disabled = !isDesktop;
  });
  if (!isDesktop) return;
  checkForDesktopUpdate();

  const currentNickname = cacheKey(getCurrentNickname());
  const linkedNickname = localStorage.getItem(HISTORY_ACCOUNT_NICKNAME_KEY) || "";
  if (linkedNickname && linkedNickname !== currentNickname) {
    historyAccountStatus.textContent = `${getCurrentNickname()} 계정 재연결 필요`;
    historyAccountStatus.title = "마지막으로 연결한 닉네임과 현재 조회 닉네임이 다릅니다.";
    state.historyAccountNickname = "";
    localStorage.removeItem(HISTORY_ACCOUNT_NICKNAME_KEY);
    await window.__TAURI__.core.invoke("logout_history_account").catch(() => {});
  }
  try {
    const account = await window.__TAURI__.core.invoke("login_from_account_file");
    state.historyPendingAccount = account;
    historyAccountStatus.textContent = "account.txt 계정 확인 중";
    await completePendingHistoryAccount();
  } catch {
    historyAccountStatus.textContent = "account.txt 선택 필요";
  }
}

async function checkForDesktopUpdate(announce = false) {
  const invoke = window.__TAURI__?.core?.invoke;
  if (!invoke) return;
  desktopUpdateCheckButton.disabled = true;
  if (announce) desktopUpdateCheckButton.textContent = "확인 중...";
  desktopUpdateButton.hidden = true;
  try {
    const update = await invoke("check_for_update");
    appVersionEl.textContent = `v${update.currentVersion}`;
    appVersionEl.title = `데스크톱 버전 ${update.currentVersion}`;
    if (!update.available) {
      if (announce) statusText.textContent = `현재 최신 버전입니다. (v${update.currentVersion})`;
      return;
    }
    desktopUpdateButton.textContent = `업데이트 v${update.latestVersion}`;
    desktopUpdateButton.hidden = false;
    if (announce) statusText.textContent = `v${update.latestVersion} 업데이트를 사용할 수 있습니다.`;
  } catch (error) {
    desktopUpdateButton.hidden = true;
    if (announce) statusText.textContent = `업데이트 확인 실패: ${String(error)}`;
  } finally {
    desktopUpdateCheckButton.disabled = false;
    desktopUpdateCheckButton.textContent = "업데이트 확인";
  }
}

async function installDesktopUpdate() {
  const invoke = window.__TAURI__?.core?.invoke;
  if (!invoke) return;
  desktopUpdateButton.disabled = true;
  statusText.textContent = "업데이트를 다운로드하고 있습니다...";
  try {
    await invoke("install_update");
    statusText.textContent = "업데이트를 설치하기 위해 앱을 다시 시작합니다.";
  } catch (error) {
    desktopUpdateButton.disabled = false;
    statusText.textContent = `업데이트 실패: ${String(error)}`;
  }
}

function renderAccountFileStatus(account, nickname = getCurrentNickname()) {
  historyAccountStatus.textContent = account?.fileName
    ? `${account.fileName} · ${nickname} 연결됨`
    : "account.txt 미설정";
  historyAccountStatus.title = account?.path || "";
}

function currentArchiveAccountIdentity() {
  const rows = [...(state.payload?.tiers || []), ...(state.payload?.djClasses || [])];
  const row = rows.find((item) => item?.userNo !== undefined && item?.userNo !== null && String(item.userNo).trim());
  if (!row) return null;
  return {
    userNo: String(row.userNo).trim(),
    nickname: String(row.nickname || state.payload?.nickname || getCurrentNickname()).trim(),
  };
}

async function connectVerifiedHistoryAccount(account, { deferIfUnavailable = false } = {}) {
  const identity = currentArchiveAccountIdentity();
  if (!identity) {
    if (deferIfUnavailable) {
      state.historyPendingAccount = account;
      return false;
    }
    throw new Error("현재 조회 계정의 회원 번호를 확인할 수 없습니다. 기록을 새로고침한 뒤 다시 선택해주세요.");
  }
  if (!account?.userNo || String(account.userNo) !== identity.userNo) {
    await window.__TAURI__?.core?.invoke?.("logout_history_account");
    state.historyPendingAccount = null;
    state.historyAccountNickname = "";
    localStorage.removeItem(HISTORY_ACCOUNT_NICKNAME_KEY);
    throw new Error(`account.txt 회원 ${account?.userNo || "확인 불가"}는 현재 조회 계정 ${identity.nickname} (회원 ${identity.userNo})과 다릅니다.`);
  }
  const nickname = state.payload?.nickname || getCurrentNickname();
  state.historyPendingAccount = null;
  state.historyAccountNickname = cacheKey(nickname);
  localStorage.setItem(HISTORY_ACCOUNT_NICKNAME_KEY, state.historyAccountNickname);
  renderAccountFileStatus(account, nickname);
  return true;
}

async function completePendingHistoryAccount() {
  if (!state.historyPendingAccount) return;
  try {
    await connectVerifiedHistoryAccount(state.historyPendingAccount, { deferIfUnavailable: true });
  } catch (error) {
    historyAccountStatus.textContent = "account.txt 계정 불일치";
    historyAccountStatus.title = String(error);
    statusText.textContent = `account.txt 연결 오류: ${String(error)}`;
  }
}

async function reconnectConfiguredHistoryAccount() {
  const invoke = window.__TAURI__?.core?.invoke;
  const nickname = cacheKey(state.payload?.nickname || getCurrentNickname());
  if (!invoke || !nickname || state.historyAccountNickname === nickname) return;
  try {
    const account = await invoke("login_from_account_file");
    state.historyPendingAccount = account;
    historyAccountStatus.textContent = "account.txt 계정 확인 중";
    await completePendingHistoryAccount();
  } catch {
    if (!state.historyPendingAccount) historyAccountStatus.textContent = "account.txt 선택 필요";
  }
}

function initFloorSelectors() {
  const options = floorLabels.map((label) => `<option value="${label}">${label}</option>`).join("");
  xMinSelect.innerHTML = options;
  xMaxSelect.innerHTML = options;
  compareFloorMinSelect.innerHTML = options;
  compareFloorMaxSelect.innerHTML = options;
  recordsFloorMinSelect.innerHTML = options;
  recordsFloorMaxSelect.innerHTML = options;
  xMinSelect.value = "1.1";
  xMaxSelect.value = "17.3";
  compareFloorMinSelect.value = "1.1";
  compareFloorMaxSelect.value = "17.3";
  recordsFloorMinSelect.value = "1.1";
  recordsFloorMaxSelect.value = "17.3";
  viewSelect.value = "chart";
  applySavedSettings();
}

function wireEvents() {
  refreshButton.addEventListener("click", () => refresh(false));
  fullRefreshButton.addEventListener("click", () => {
    if (confirm("캐시를 무시하고 전체 기록을 다시 불러올까요?")) refresh(true);
  });
  nicknameApplyButton.addEventListener("click", () => applyNickname());
  nicknameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") applyNickname();
  });
  nicknameInput.addEventListener("input", () => saveCurrentNickname(nicknameInput.value));
  compareLoadButton.addEventListener("click", () => loadComparison(false));
  compareNicknameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") loadComparison(false);
  });
  [viewSelect, buttonFilter, patternFilter, searchInput, limitSelect, nameWidthInput, recordsFloorMinSelect, recordsFloorMaxSelect, compareNicknameInput, compareModeSelect, compareSortSelect, compareMinZSelect, compareFloorMinSelect, compareFloorMaxSelect, compareStdFloorSelect].forEach((el) => {
    el.addEventListener("input", () => {
      if (el === viewSelect) state.sortKey = null;
      state.view = viewSelect.value;
      if ([compareSortSelect, compareModeSelect, compareMinZSelect, compareFloorMinSelect, compareFloorMaxSelect, compareStdFloorSelect].includes(el)) state.sortKey = null;
      saveSettings();
      render();
    });
  });
  chartMetricSelect.addEventListener("change", () => {
    storeCurrentChartRange();
    storeCurrentChartXRange();
    state.chartMetric = chartMetricSelect.value;
    restoreChartRange(state.chartMetric);
    saveSettings();
    renderChart();
  });
  compareChartMetricSelect.addEventListener("change", () => {
    storeCompareChartRange(state.compareChartMetric);
    state.compareChartMetric = compareChartMetricSelect.value;
    restoreCompareChartRange(state.compareChartMetric);
    saveSettings();
    renderCompareChart();
  });
  compareChartModeSelect.addEventListener("change", () => {
    saveSettings();
    renderCompareChart();
  });
  [compareChartMinInput, compareChartMaxInput].forEach((input) => {
    input.addEventListener("input", () => {
      compareChartAutoInput.checked = false;
      updateCompareChartRangeControls();
      storeCompareChartRange();
      saveSettings();
      renderCompareChart();
    });
  });
  compareChartAutoInput.addEventListener("change", () => {
    updateCompareChartRangeControls();
    storeCompareChartRange();
    saveSettings();
    renderCompareChart();
  });
  compareChartImageButton.addEventListener("click", exportCompareChartImage);
  [xMinSelect, xMaxSelect, yMinInput, yMinAutoInput, yMaxInput, yMaxAutoInput].forEach((el) => {
    el.addEventListener("input", () => {
      yMinInput.disabled = yMinAutoInput.checked;
      yMaxInput.disabled = ["score", "scorePoint"].includes(chartMetricSelect.value) || yMaxAutoInput.checked;
      storeCurrentChartRange();
      storeCurrentChartXRange();
      saveSettings();
      renderChart();
    });
  });
  chartImageButton.addEventListener("click", exportChartImage);
  desktopUpdateCheckButton.addEventListener("click", () => checkForDesktopUpdate(true));
  desktopUpdateButton.addEventListener("click", installDesktopUpdate);
  historyAccountLoginButton.addEventListener("click", loginHistoryAccount);
  historyAccountFileButton.addEventListener("click", selectAccountFile);
  historyAccountToken.addEventListener("keydown", (event) => {
    if (event.key === "Enter") loginHistoryAccount();
  });
  historyCollectButton.addEventListener("click", collectRecordHistories);
  historyFullCollectButton.addEventListener("click", () => {
    if (confirm("현재 기록의 모든 패턴 히스토리를 다시 수집할까요?")) collectRecordHistories({ force: true });
  });
  historyResetButton.addEventListener("click", resetRecordHistories);
  historyImageButton.addEventListener("click", exportHistoryImage);
  [historyStartDate, historyEndDate].forEach((input) => {
    input.addEventListener("input", () => {
      saveSettings();
      renderHistoryView();
    });
  });
  historyRangeResetButton.addEventListener("click", () => {
    historyStartDate.value = "";
    historyEndDate.value = "";
    saveSettings();
    renderHistoryView();
  });
  achievementColumnsInput.addEventListener("input", () => {
    achievementColumnsInput.value = String(Math.min(MAX_ACHIEVEMENT_COLUMNS, Math.max(1, Number(achievementColumnsInput.value) || 1)));
    saveSettings();
  });
  [achievementAutoLogPowerInput, achievementAutoHoursInput].forEach((input) => {
    input.addEventListener("input", saveSettings);
  });
  achievementAutoSelectButton.addEventListener("click", autoSelectAchievements);
  achievementSelectVisibleButton.addEventListener("click", selectVisibleAchievements);
  achievementClearButton.addEventListener("click", () => {
    state.achievementSelected.clear();
    renderAchievementList();
  });
  achievementImageButton.addEventListener("click", exportAchievementImage);
  achievementList.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-achievement-id]");
    if (!checkbox) return;
    const id = decodeURIComponent(checkbox.dataset.achievementId || "");
    if (checkbox.checked) state.achievementSelected.add(id);
    else state.achievementSelected.delete(id);
    renderAchievementList();
  });
  achievementList.addEventListener("pointerdown", startAchievementDragSelection);
  achievementList.addEventListener("pointerover", continueAchievementDragSelection);
  achievementList.addEventListener("dragstart", (event) => event.preventDefault());
  achievementList.addEventListener("click", (event) => {
    if (!achievementSuppressClick) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
  document.addEventListener("pointerup", finishAchievementDragSelection);
  document.addEventListener("pointercancel", finishAchievementDragSelection);
  [selfCompareStart, selfCompareEnd].forEach((input) => {
    input.addEventListener("input", () => {
      state.sortKey = null;
      saveSettings();
      renderSelfCompareView();
    });
  });
  selfCompareNowButton.addEventListener("click", () => {
    selfCompareEnd.value = "";
    saveSettings();
    renderSelfCompareView();
  });
  [tagsGenreSelect, tagsBpmMinInput, tagsBpmMaxInput, tagsRecordModeSelect, tagsWeightSelect, tagsPatternOnlyInput, tagsScPatternOnlyInput, tagsMatchModeSelect, tagsSortSelect, tagsFacetSearchInput].forEach((control) => {
    control.addEventListener("input", () => {
      saveSettings();
      renderTagsView();
    });
  });
  tagsFacetList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tag-value]");
    if (!button) return;
    const tag = decodeURIComponent(button.dataset.tagValue || "");
    if (!tag) return;
    if (state.tagsSelected.has(tag)) state.tagsSelected.delete(tag);
    else state.tagsSelected.add(tag);
    saveSettings();
    renderTagsView();
  });
  tagsClearButton.addEventListener("click", () => {
    tagsGenreSelect.value = "";
    tagsBpmMinInput.value = "";
    tagsBpmMaxInput.value = "";
    tagsRecordModeSelect.value = "";
    tagsWeightSelect.value = "";
    tagsPatternOnlyInput.checked = false;
    tagsScPatternOnlyInput.checked = false;
    tagsMatchModeSelect.value = "all";
    tagsSortSelect.value = "name";
    tagsFacetSearchInput.value = "";
    state.tagsSelected.clear();
    saveSettings();
    renderTagsView();
  });
  tagsRefreshButton.addEventListener("click", () => loadTagsData(true));
  debugRatioInput.addEventListener("input", () => {
    setDebugRatio(debugRatioInput.value);
    saveSettings();
    renderDebugView();
  });
  debugRatioRange.addEventListener("input", () => {
    setDebugRatio(debugRatioRange.value);
    saveSettings();
    renderDebugView();
  });
  debugRatioResetButton.addEventListener("click", () => {
    setDebugRatio(currentFloorRelation());
    saveSettings();
    renderDebugView();
  });
  themeToggleButton.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    saveSettings();
  });
  document.addEventListener("wheel", handleWheelControl, { passive: false });
  historyStopButton.addEventListener("click", () => {
    state.historyStopRequested = true;
    historyStatus.textContent = "현재 요청이 끝나면 중지합니다.";
  });
  window.addEventListener("resize", () => {
    renderChart();
    renderCompareChart();
    renderDebugView();
  });
}

function applySavedSettings() {
  const settings = loadSettings();
  nicknameInput.value = settings.nickname || getNicknameHistory()[0] || DEFAULT_NICKNAME;
  renderRecentNicknames();
  setIfOptionExists(viewSelect, settings.view || "chart");
  setIfOptionExists(buttonFilter, settings.buttonFilter || "");
  setIfOptionExists(patternFilter, settings.patternFilter || "");
  setIfOptionExists(limitSelect, settings.limitSelect || "100");
  setIfOptionExists(chartMetricSelect, settings.chartMetric || "score");
  setIfOptionExists(xMinSelect, settings.xMin || "1.1");
  setIfOptionExists(xMaxSelect, settings.xMax || "17.3");
  state.chartMetric = chartMetricSelect.value;
  state.chartYMinByMetric = { score: settings.yMin || "", ...(settings.chartYMinByMetric || {}) };
  state.chartYMinAutoByMetric = { score: settings.yMinAuto !== false, ...(settings.chartYMinAutoByMetric || {}) };
  state.chartYMaxByMetric = { score: "100", scorePoint: "10", ...(settings.chartYMaxByMetric || {}) };
  state.chartYMaxAutoByMetric = { score: true, scorePoint: true, ...(settings.chartYMaxAutoByMetric || {}) };
  state.chartXRangeByMode = {
    floor: { min: settings.xMin || "1.1", max: settings.xMax || "17.3" },
    ...(settings.chartXRangeByMode || {}),
  };
  restoreChartRange(state.chartMetric);
  searchInput.value = settings.search || "";
  nameWidthInput.value = settings.nameWidth || "320";
  compareNicknameInput.value = settings.compareNickname || "";
  setIfOptionExists(compareModeSelect, settings.compareMode || "");
  setIfOptionExists(compareSortSelect, settings.compareSort || "absZDiff");
  setIfOptionExists(compareMinZSelect, settings.compareMinZ || "0");
  setIfOptionExists(compareFloorMinSelect, settings.compareFloorMin || "1.1");
  setIfOptionExists(compareFloorMaxSelect, settings.compareFloorMax || "17.3");
  setIfOptionExists(recordsFloorMinSelect, settings.recordsFloorMin || "1.1");
  setIfOptionExists(recordsFloorMaxSelect, settings.recordsFloorMax || "17.3");
  setIfOptionExists(compareStdFloorSelect, settings.compareStdFloor || "0.05");
  setIfOptionExists(compareChartMetricSelect, settings.compareChartMetric || "score");
  setIfOptionExists(compareChartModeSelect, settings.compareChartMode || "vector");
  state.compareChartMetric = compareChartMetricSelect.value;
  state.compareChartRanges = settings.compareChartRanges || {};
  historyStartDate.value = settings.historyStartDate || "";
  historyEndDate.value = settings.historyEndDate || "";
  achievementColumnsInput.value = String(Math.min(MAX_ACHIEVEMENT_COLUMNS, Math.max(1, Number(settings.achievementColumns) || 1)));
  achievementAutoLogPowerInput.value = String(Math.max(0, Number(settings.achievementAutoLogPower) || 1));
  achievementAutoHoursInput.value = String(Math.max(1, Number(settings.achievementAutoHours) || 72));
  selfCompareStart.value = settings.selfCompareStart || "";
  selfCompareEnd.value = settings.selfCompareEnd || "";
  setIfOptionExists(tagsRecordModeSelect, settings.tagsRecordMode || "");
  setIfOptionExists(tagsWeightSelect, settings.tagsWeight || "");
  tagsPatternOnlyInput.checked = Boolean(settings.tagsPatternOnly && buttonFilter.value);
  tagsScPatternOnlyInput.checked = Boolean(settings.tagsScPatternOnly ?? settings.tagsExcludeMx);
  setIfOptionExists(tagsMatchModeSelect, settings.tagsMatchMode || "all");
  setIfOptionExists(tagsSortSelect, settings.tagsSort || "name");
  tagsBpmMinInput.value = settings.tagsBpmMin || "";
  tagsBpmMaxInput.value = settings.tagsBpmMax || "";
  tagsFacetSearchInput.value = settings.tagsFacetSearch || "";
  tagsGenreSelect.dataset.savedValue = settings.tagsGenre || "";
  state.tagsSelected = new Set(Array.isArray(settings.tagsSelected) ? settings.tagsSelected.filter(Boolean) : []);
  const savedDebugRatio = Number(settings.debugRatio);
  const migratedDebugRatio = Math.abs(savedDebugRatio - 0.905) < 1e-9 ? currentFloorRelation() : settings.debugRatio;
  setDebugRatio(migratedDebugRatio || currentFloorRelation());
  applyTheme(settings.theme || "light");
  restoreCompareChartRange(state.compareChartMetric);
  state.view = viewSelect.value;
  applyNameWidth();
  updateCompareControls();
}

function saveSettings() {
  storeCurrentChartRange();
  storeCurrentChartXRange();
  storeCompareChartRange();
  const settings = {
    view: viewSelect.value,
    buttonFilter: buttonFilter.value,
    patternFilter: patternFilter.value,
    search: searchInput.value,
    nickname: getCurrentNickname(),
    compareNickname: compareNicknameInput.value.trim(),
    compareMode: compareModeSelect.value,
    compareSort: compareSortSelect.value,
    compareMinZ: compareMinZSelect.value,
    compareFloorMin: compareFloorMinSelect.value,
    compareFloorMax: compareFloorMaxSelect.value,
    recordsFloorMin: recordsFloorMinSelect.value,
    recordsFloorMax: recordsFloorMaxSelect.value,
    compareStdFloor: compareStdFloorSelect.value,
    compareChartMetric: compareChartMetricSelect.value,
    compareChartMode: compareChartModeSelect.value,
    compareChartRanges: state.compareChartRanges,
    limitSelect: limitSelect.value,
    nameWidth: nameWidthInput.value,
    chartMetric: chartMetricSelect.value,
    xMin: xMinSelect.value,
    xMax: xMaxSelect.value,
    yMin: yMinInput.value,
    yMinAuto: yMinAutoInput.checked,
    chartYMinByMetric: state.chartYMinByMetric,
    chartYMinAutoByMetric: state.chartYMinAutoByMetric,
    chartYMaxByMetric: state.chartYMaxByMetric,
    chartYMaxAutoByMetric: state.chartYMaxAutoByMetric,
    chartXRangeByMode: state.chartXRangeByMode,
    historyStartDate: historyStartDate.value,
    historyEndDate: historyEndDate.value,
    achievementColumns: achievementColumnsInput.value,
    achievementAutoLogPower: achievementAutoLogPowerInput.value,
    achievementAutoHours: achievementAutoHoursInput.value,
    selfCompareStart: selfCompareStart.value,
    selfCompareEnd: selfCompareEnd.value,
    tagsGenre: tagsGenreSelect.value,
    tagsBpmMin: tagsBpmMinInput.value,
    tagsBpmMax: tagsBpmMaxInput.value,
    tagsRecordMode: tagsRecordModeSelect.value,
    tagsWeight: tagsWeightSelect.value,
    tagsPatternOnly: tagsPatternOnlyInput.checked,
    tagsScPatternOnly: tagsScPatternOnlyInput.checked,
    tagsMatchMode: tagsMatchModeSelect.value,
    tagsSort: tagsSortSelect.value,
    tagsFacetSearch: tagsFacetSearchInput.value,
    tagsSelected: [...state.tagsSelected],
    debugRatio: debugRatioInput.value,
    theme: document.documentElement.dataset.theme || "light",
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  applyNameWidth();
}

function storeCurrentChartXRange() {
  const mode = state.chartXMode || "floor";
  if (!xMinSelect?.value || !xMaxSelect?.value) return;
  state.chartXRangeByMode[mode] = { min: xMinSelect.value, max: xMaxSelect.value };
}

function storeCurrentChartRange() {
  const metric = state.chartMetric || chartMetricSelect?.value || "score";
  state.chartYMinByMetric[metric] = yMinInput?.value || "";
  state.chartYMinAutoByMetric[metric] = yMinAutoInput?.checked !== false;
  state.chartYMaxByMetric[metric] = yMaxInput?.value || "";
  state.chartYMaxAutoByMetric[metric] = yMaxAutoInput?.checked !== false;
}

function restoreChartRange(metric) {
  yMinInput.value = state.chartYMinByMetric[metric] || "";
  yMinAutoInput.checked = state.chartYMinAutoByMetric[metric] !== false;
  yMinInput.disabled = yMinAutoInput.checked;
  const fixedMaxValue = metric === "score" ? "100" : metric === "scorePoint" ? "10" : "";
  const fixedMax = Boolean(fixedMaxValue);
  yMaxInput.value = fixedMax ? fixedMaxValue : state.chartYMaxByMetric[metric] || "";
  yMaxAutoInput.checked = fixedMax || state.chartYMaxAutoByMetric[metric] !== false;
  yMaxAutoInput.disabled = fixedMax;
  yMaxInput.disabled = fixedMax || yMaxAutoInput.checked;
}

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
  } catch {
    return {};
  }
}

function applyTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  themeToggleButton.textContent = next === "dark" ? "라이트 모드" : "다크 모드";
  themeToggleButton.setAttribute("aria-pressed", String(next === "dark"));
}

function handleWheelControl(event) {
  const control = event.target.closest("select, input[type='number'], input[type='range'], input[type='date']");
  if (!control || control.disabled || control.readOnly || event.deltaY === 0) return;
  event.preventDefault();
  const direction = event.deltaY > 0 ? 1 : -1;
  if (control instanceof HTMLSelectElement) {
    let nextIndex = control.selectedIndex + direction;
    while (nextIndex >= 0 && nextIndex < control.options.length && control.options[nextIndex].disabled) nextIndex += direction;
    if (nextIndex < 0 || nextIndex >= control.options.length) return;
    control.selectedIndex = nextIndex;
  } else {
    if (!control.value && control.type === "date") return;
    const stepCount = control.type === "number" || control.type === "range"
      ? (control === achievementColumnsInput ? 1 : event.shiftKey ? 10 : 5)
      : 1;
    try {
      direction > 0 ? control.stepDown(stepCount) : control.stepUp(stepCount);
    } catch {
      return;
    }
  }
  control.dispatchEvent(new Event("input", { bubbles: true }));
  control.dispatchEvent(new Event("change", { bubbles: true }));
}

function loadTop50ScaleCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(TOP50_SCALE_CACHE_KEY) || "null");
    if (!isValidButtonTop50BaseMax(cached?.baseMaxByButton) || !isValidFloorPatternCounts(cached?.floorPatternCounts)) return null;
    state.buttonTop50BaseMax = cached.baseMaxByButton;
    state.floorPatternCounts = cached.floorPatternCounts;
    return cached;
  } catch {
    return null;
  }
}

async function refreshTop50ScaleCache(force = false) {
  const cached = loadTop50ScaleCache();
  if (!force && cached && Date.now() - Number(cached.updatedAt || 0) < TOP50_SCALE_CACHE_TTL) return false;
  try {
    const response = await fetch(SONG_DB_URL, { credentials: "omit" });
    if (!response.ok) return false;
    const songs = await response.json();
    const { baseMaxByButton, floorPatternCounts } = calculateSongCatalogMetrics(songs);
    if (!isValidButtonTop50BaseMax(baseMaxByButton) || !isValidFloorPatternCounts(floorPatternCounts)) return false;
    state.buttonTop50BaseMax = baseMaxByButton;
    state.floorPatternCounts = floorPatternCounts;
    localStorage.setItem(TOP50_SCALE_CACHE_KEY, JSON.stringify({ updatedAt: Date.now(), baseMaxByButton, floorPatternCounts }));
    return true;
  } catch {
    return false;
  }
}

function calculateSongCatalogMetrics(songs) {
  if (!Array.isArray(songs)) return { baseMaxByButton: null, floorPatternCounts: null };
  const baseMaxByButton = {};
  const floorPatternCounts = {};
  for (const button of BUTTONS) {
    const floorMaxPoints = [];
    floorPatternCounts[String(button)] = {};
    for (const song of songs) {
      const patterns = song?.patterns?.[`${button}B`];
      if (!patterns || typeof patterns !== "object") continue;
      for (const [patternName, pattern] of Object.entries(patterns)) {
        const difficultyConstant = baseDifficultyConstantForFloor(pattern?.floorName);
        if (!Number.isFinite(difficultyConstant)) continue;
        floorMaxPoints.push(10 * difficultyConstant);
        const patternCounts = floorPatternCounts[String(button)][patternName] || {};
        patternCounts[pattern.floorName] = Number(patternCounts[pattern.floorName] || 0) + 1;
        floorPatternCounts[String(button)][patternName] = patternCounts;
      }
    }
    if (floorMaxPoints.length < 50) return { baseMaxByButton: null, floorPatternCounts: null };
    floorMaxPoints.sort((a, b) => b - a);
    baseMaxByButton[String(button)] = floorMaxPoints.slice(0, 50).reduce((sum, point) => sum + point, 0);
  }
  return { baseMaxByButton, floorPatternCounts };
}

function isValidButtonTop50BaseMax(value) {
  return value && BUTTONS.every((button) => Number.isFinite(Number(value[String(button)])) && Number(value[String(button)]) > 0);
}

function isValidFloorPatternCounts(value) {
  return value && BUTTONS.every((button) => value[String(button)] && typeof value[String(button)] === "object");
}

function loadTagsCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(TAGS_CACHE_KEY) || "null");
    if (cached?.schemaVersion !== TAGS_CACHE_SCHEMA_VERSION || !Array.isArray(cached?.rows) || cached.rows.length < 100) return null;
    if (cached.rows.some((row) => !row?.scLevels || typeof row.scLevels !== "object")) return null;
    state.tagsRows = cached.rows;
    state.tagsUpdatedAt = Number(cached.updatedAt) || 0;
    populateTagsGenreOptions();
    return cached;
  } catch {
    return null;
  }
}

async function loadTagsData(force = false) {
  if (state.tagsLoading) return;
  const cached = loadTagsCache();
  if (!force && cached && Date.now() - state.tagsUpdatedAt < TAGS_CACHE_TTL) {
    if (viewSelect.value === "tags") renderTagsView();
    return;
  }

  state.tagsLoading = true;
  state.tagsLoadError = "";
  tagsRefreshButton.disabled = true;
  tagsStatus.textContent = cached ? "저장된 태그를 표시하며 새 데이터를 확인하고 있습니다." : "태그와 곡 목록을 불러오고 있습니다.";
  try {
    const [tagsResponse, songsResponse, abilityResponse] = await Promise.all([
      fetch(TAGS_API_URL, {
        credentials: "omit",
        headers: { apikey: TAGS_ANON_KEY, Authorization: `Bearer ${TAGS_ANON_KEY}`, Accept: "application/json" },
      }),
      fetch(SONG_DB_URL, { credentials: "omit" }),
      fetch(TAGS_ABILITY_API_URL, {
        credentials: "omit",
        headers: { apikey: TAGS_ANON_KEY, Authorization: `Bearer ${TAGS_ANON_KEY}`, Accept: "application/json" },
      }),
    ]);
    if (!tagsResponse.ok) throw new Error(`태그 API HTTP ${tagsResponse.status}`);
    if (!songsResponse.ok) throw new Error(`곡 목록 HTTP ${songsResponse.status}`);
    if (!abilityResponse.ok) throw new Error(`버튼별 태그 API HTTP ${abilityResponse.status}`);
    const [tagRows, songs, abilityRows] = await Promise.all([tagsResponse.json(), songsResponse.json(), abilityResponse.json()]);
    const rows = normalizeTagsRows(tagRows, songs, abilityRows);
    if (rows.length < 100) throw new Error(`태그 데이터가 너무 적습니다. (${rows.length}곡)`);
    state.tagsRows = rows;
    state.tagsUpdatedAt = Date.now();
    populateTagsGenreOptions();
    try {
      localStorage.setItem(TAGS_CACHE_KEY, JSON.stringify({ schemaVersion: TAGS_CACHE_SCHEMA_VERSION, updatedAt: state.tagsUpdatedAt, rows }));
    } catch {
      // The current data still remains usable when storage quota is unavailable.
    }
  } catch (error) {
    state.tagsLoadError = error.message || String(error);
    tagsStatus.textContent = cached
      ? `태그 갱신 실패 · 저장된 ${state.tagsRows.length}곡 사용 · ${error.message || error}`
      : `태그를 불러오지 못했습니다. ${error.message || error}`;
  } finally {
    state.tagsLoading = false;
    tagsRefreshButton.disabled = false;
    if (viewSelect.value === "tags") renderTagsView();
  }
}

function normalizeTagsRows(tagRows, songs, abilityRows = []) {
  if (!Array.isArray(tagRows) || !Array.isArray(songs)) return [];
  const abilityByButton = normalizeTagAbilities(abilityRows);
  const tagsByTitle = new Map(tagRows.map((row) => [String(row.song_title), row]));
  return songs.map((song) => {
    const tagRow = tagsByTitle.get(String(song.title)) || {};
    const parsed = parseTagsText(tagRow.tags, abilityByButton);
    const availablePatterns = {};
    const scLevels = {};
    const scFloors = {};
    const scFloorNames = {};
    for (const button of BUTTONS) {
      const buttonPatterns = song?.patterns?.[`${button}B`] || {};
      availablePatterns[String(button)] = Object.keys(buttonPatterns);
      scLevels[String(button)] = buttonPatterns?.SC?.level ?? null;
      scFloors[String(button)] = buttonPatterns?.SC?.floor ?? null;
      scFloorNames[String(button)] = buttonPatterns?.SC?.floorName ?? null;
    }
    return {
      title: Number(song.title),
      name: String(song.name || `#${song.title}`),
      composer: String(song.composer || ""),
      dlcCode: String(song.dlcCode || ""),
      aka: String(tagRow.aka || ""),
      aliases: String(tagRow.aka || "").split(",").map((value) => value.trim()).filter(Boolean),
      tagsRaw: String(tagRow.tags || ""),
      bpmText: parsed.bpmText,
      bpmMin: parsed.bpmMin,
      bpmMax: parsed.bpmMax,
      genre: parsed.genre,
      tokens: parsed.tokens,
      availablePatterns,
      scLevels,
      scFloors,
      scFloorNames,
    };
  });
}

function normalizeTagAbilities(rows) {
  const result = Object.fromEntries(BUTTONS.map((button) => [String(button), new Map()]));
  for (const row of Array.isArray(rows) ? rows : []) {
    const button = String(row?.id || "").replace(/B$/i, "");
    const aliases = result[button];
    if (!aliases || !Array.isArray(row?.ability_set)) continue;
    for (const group of row.ability_set) {
      const label = String(group?.name || "").trim();
      if (!label) continue;
      const color = /^#[0-9a-f]{6}$/i.test(String(group?.color || "")) ? String(group.color) : "";
      for (const alias of new Set([label, ...(Array.isArray(group?.tags) ? group.tags : [])])) {
        const key = normalizeTagAlias(alias);
        if (key) aliases.set(key, { label, color });
      }
    }
  }
  return result;
}

function normalizeTagAlias(value) {
  return String(value || "").trim().toLocaleLowerCase("ko");
}

function parseTagsText(value, abilityByButton = {}) {
  let bpmText = "";
  let genre = "";
  const tokens = [];
  const seen = new Set();
  for (const rawValue of String(value || "").split(",")) {
    const raw = rawValue.trim();
    if (!raw) continue;
    const bpmMatch = raw.match(/^BPM\s*:\s*(.+)$/i);
    if (bpmMatch) {
      bpmText = bpmMatch[1].trim();
      continue;
    }
    const genreMatch = raw.match(/^GENRE\s*:\s*(.+)$/i);
    if (genreMatch) {
      genre = genreMatch[1].trim();
      continue;
    }
    const scopedMatch = raw.match(/^(ALL|(?:[4568]B)(?:\s*&\s*[4568]B)*)\s*:\s*(.+)$/i);
    let tagText = (scopedMatch ? scopedMatch[2] : raw).trim();
    let weight = "";
    tagText = tagText.replace(/\|\{(\d+)\}/g, (_match, value) => {
      if (!weight) weight = value;
      return "";
    }).trim();
    let pattern = "";
    let patternMatch = tagText.match(/_(NM|HD|MX|SC)$/i);
    while (patternMatch) {
      pattern ||= patternMatch[1].toUpperCase();
      tagText = tagText.slice(0, -patternMatch[0].length).trim();
      patternMatch = tagText.match(/_(NM|HD|MX|SC)$/i);
    }
    if (!tagText) continue;

    const requestedButtons = scopedMatch
      ? scopedMatch[1].toUpperCase() === "ALL"
        ? BUTTONS.map(String)
        : scopedMatch[1].toUpperCase().match(/[4568](?=B)/g) || []
      : BUTTONS.map(String);
    const alias = normalizeTagAlias(tagText);
    const buttonMatches = requestedButtons
      .map((button) => ({ button, ability: abilityByButton?.[button]?.get(alias) }))
      .filter((item) => item.ability);

    if (!buttonMatches.length) {
      addNormalizedTagToken(tokens, seen, {
        scope: "GENERAL",
        button: "",
        label: tagText,
        originalLabel: tagText,
        weight: "",
        pattern,
        color: "",
      });
      continue;
    }
    for (const { button, ability } of buttonMatches) {
      addNormalizedTagToken(tokens, seen, {
        scope: `${button}B`,
        button,
        label: ability.label,
        originalLabel: tagText,
        weight,
        pattern,
        color: ability.color,
      });
    }
  }
  const bpmNumbers = (bpmText.match(/\d+(?:\.\d+)?/g) || []).map(Number).filter(Number.isFinite);
  return {
    bpmText,
    bpmMin: bpmNumbers.length ? Math.min(...bpmNumbers) : null,
    bpmMax: bpmNumbers.length ? Math.max(...bpmNumbers) : null,
    genre,
    tokens,
  };
}

function addNormalizedTagToken(tokens, seen, token) {
  const key = `${token.scope}|${token.label}|${token.weight}|${token.pattern}`;
  if (!token.label || seen.has(key)) return;
  seen.add(key);
  tokens.push(token);
}

function populateTagsGenreOptions() {
  const current = tagsGenreSelect.value || tagsGenreSelect.dataset.savedValue || "";
  const genres = [...new Set(state.tagsRows.map((row) => row.genre).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "ko", { sensitivity: "base" }));
  tagsGenreSelect.innerHTML = `<option value="">전체</option>${genres.map((genre) => `<option value="${escapeHtml(genre)}">${escapeHtml(genre)}</option>`).join("")}`;
  if ([...tagsGenreSelect.options].some((option) => option.value === current)) tagsGenreSelect.value = current;
  delete tagsGenreSelect.dataset.savedValue;
}

function getTagsRecordStats() {
  const records = (state.payload?.records || []).filter((record) => {
    if (buttonFilter.value && String(record.button) !== buttonFilter.value) return false;
    if (patternFilter.value && String(record.pattern || "") !== patternFilter.value) return false;
    return true;
  });
  const stats = new Map();
  for (const record of records) {
    const key = String(record.title);
    if (!stats.has(key)) stats.set(key, { count: 0, bestScore: NaN, buttons: new Set(), patterns: new Set() });
    const item = stats.get(key);
    item.count += 1;
    const score = Number(record.score);
    if (Number.isFinite(score) && (!Number.isFinite(item.bestScore) || score > item.bestScore)) item.bestScore = score;
    item.buttons.add(String(record.button));
    item.patterns.add(String(record.pattern || ""));
  }
  return stats;
}

function tagsForCurrentScope(row) {
  const button = buttonFilter.value;
  return (row.tokens || []).filter((token) => {
    if (!button && token.scope !== "GENERAL") return false;
    if (button && token.scope !== "GENERAL" && token.button !== button) return false;
    if (tagsPatternOnlyInput.checked && token.scope === "GENERAL") return false;
    if (patternFilter.value && token.pattern && token.pattern !== patternFilter.value) return false;
    if (tagsScPatternOnlyInput.checked && ["NM", "HD", "MX"].includes(token.pattern)) return false;
    return true;
  });
}

function tagTokenMatchesWeight(token, weight) {
  if (!weight) return true;
  if (token.scope === "GENERAL") return false;
  return weight === "none" ? !token.weight : token.weight === weight;
}

function tagRowHasAvailablePattern(row) {
  const button = buttonFilter.value;
  const pattern = patternFilter.value;
  if (button && !(row.availablePatterns?.[button] || []).length) return false;
  if (!pattern) return true;
  if (button) return (row.availablePatterns?.[button] || []).includes(pattern);
  return BUTTONS.some((item) => (row.availablePatterns?.[String(item)] || []).includes(pattern));
}

function renderTagsView() {
  if (viewSelect.value !== "tags") return;
  const hasButtonScope = Boolean(buttonFilter.value);
  tagsPatternOnlyInput.disabled = !hasButtonScope;
  if (!hasButtonScope) tagsPatternOnlyInput.checked = false;
  if (!state.tagsRows.length) {
    const cached = loadTagsCache();
    if (!cached) {
      const failed = Boolean(state.tagsLoadError);
      tagsTable.innerHTML = `<tbody><tr><td class="empty">${failed ? "태그 데이터를 불러오지 못했습니다. 태그 새로고침으로 다시 시도해 주세요." : "태그 데이터를 불러오고 있습니다."}</td></tr></tbody>`;
      tagsFacetList.innerHTML = "";
      tagsResultSummary.textContent = "";
      if (!state.tagsLoading && !failed) loadTagsData(false);
      return;
    }
  }
  if (Date.now() - state.tagsUpdatedAt >= TAGS_CACHE_TTL && !state.tagsLoading) loadTagsData(true);

  const recordStats = getTagsRecordStats();
  const query = searchInput.value.trim().toLocaleLowerCase("ko");
  const bpmMin = tagsBpmMinInput.value === "" ? null : Number(tagsBpmMinInput.value);
  const bpmMax = tagsBpmMaxInput.value === "" ? null : Number(tagsBpmMaxInput.value);
  const weight = tagsWeightSelect.value;
  const baseRows = state.tagsRows.filter((row) => {
    if (!tagRowHasAvailablePattern(row)) return false;
    if (tagsPatternOnlyInput.checked && !tagsForCurrentScope(row).length) return false;
    if (query && !`${row.title} ${row.name} ${row.composer} ${row.aka} ${row.tagsRaw}`.toLocaleLowerCase("ko").includes(query)) return false;
    if (tagsGenreSelect.value && row.genre !== tagsGenreSelect.value) return false;
    if (Number.isFinite(bpmMin) && (!Number.isFinite(row.bpmMax) || row.bpmMax < bpmMin)) return false;
    if (Number.isFinite(bpmMax) && (!Number.isFinite(row.bpmMin) || row.bpmMin > bpmMax)) return false;
    const stats = recordStats.get(String(row.title));
    if (tagsRecordModeSelect.value === "recorded" && !stats) return false;
    if (tagsRecordModeSelect.value === "unrecorded" && stats) return false;
    if (weight) {
      const scopedPatternTokens = (row.tokens || []).filter((token) => token.scope !== "GENERAL"
        && buttonFilter.value && token.button === buttonFilter.value
        && (!patternFilter.value || !token.pattern || token.pattern === patternFilter.value)
        && (!tagsScPatternOnlyInput.checked || !["NM", "HD", "MX"].includes(token.pattern)));
      const hasWeight = weight === "none"
        ? scopedPatternTokens.some((token) => !token.weight)
        : scopedPatternTokens.some((token) => token.weight === weight);
      if (!hasWeight) return false;
    }
    return true;
  });

  const facetCounts = new Map();
  for (const row of baseRows) {
    const labels = new Set(tagsForCurrentScope(row).map((token) => token.label));
    for (const label of labels) facetCounts.set(label, Number(facetCounts.get(label) || 0) + 1);
  }
  const unavailableSelected = [...state.tagsSelected].filter((selected) => !facetCounts.has(selected));
  if (unavailableSelected.length) {
    unavailableSelected.forEach((selected) => state.tagsSelected.delete(selected));
    saveSettings();
  }

  const selected = [...state.tagsSelected];
  const matchAll = tagsMatchModeSelect.value !== "any";
  const rows = baseRows.filter((row) => {
    if (!selected.length) return true;
    const tokens = tagsForCurrentScope(row);
    const hasMatchingTag = (tag) => tokens.some((token) => token.label === tag && tagTokenMatchesWeight(token, weight));
    return matchAll ? selected.every(hasMatchingTag) : selected.some(hasMatchingTag);
  }).map((row) => ({ ...row, recordStats: recordStats.get(String(row.title)) || null, visibleTokens: tagsForCurrentScope(row) }));

  sortTagRows(rows);
  renderTagsFacets(facetCounts);
  renderTagsTable(rows);
  const recordedCount = rows.filter((row) => row.recordStats).length;
  tagsResultSummary.innerHTML = `<strong>${rows.length.toLocaleString()}곡</strong><span>전체 ${state.tagsRows.length.toLocaleString()}곡 · 내 기록 ${recordedCount.toLocaleString()}곡 · 표시 조건은 상단 버튼/패턴/검색을 포함합니다.</span>`;
  const scopeLabel = tagsPatternOnlyInput.checked
    ? `${buttonFilter.value}B 패턴`
    : buttonFilter.value ? `공통 + ${buttonFilter.value}B` : "공통";
  tagsSelectedSummary.textContent = selected.length ? `${scopeLabel} · ${selected.length}개 선택 · ${selected.join(" + ")}` : `${scopeLabel} · 선택 없음`;
  if (!state.tagsLoading) tagsStatus.textContent = `${state.tagsRows.length.toLocaleString()}곡 · ${formatDate(new Date(state.tagsUpdatedAt).toISOString())} 갱신`;
}

function sortTagRows(rows) {
  const mode = tagsSortSelect.value;
  const selectedButton = buttonFilter.value;
  const byName = (a, b) => a.name.localeCompare(b.name, "ko", { sensitivity: "base" }) || a.title - b.title;
  const byDifficulty = (a, b, descending) => {
    const aFloor = Number(a.scFloors?.[selectedButton]);
    const bFloor = Number(b.scFloors?.[selectedButton]);
    const aValid = Number.isFinite(aFloor) && aFloor > 0;
    const bValid = Number.isFinite(bFloor) && bFloor > 0;
    if (!aValid && !bValid) return byName(a, b);
    if (!aValid) return 1;
    if (!bValid) return -1;
    return (descending ? bFloor - aFloor : aFloor - bFloor) || byName(a, b);
  };
  if (mode === "difficultyDesc" && selectedButton) rows.sort((a, b) => byDifficulty(a, b, true));
  else if (mode === "difficultyAsc" && selectedButton) rows.sort((a, b) => byDifficulty(a, b, false));
  else if (mode === "bpmAsc") rows.sort((a, b) => compareForSort(a.bpmMin, b.bpmMin) || byName(a, b));
  else if (mode === "bpmDesc") rows.sort((a, b) => compareForSort(b.bpmMax, a.bpmMax) || byName(a, b));
  else if (mode === "tagCount") rows.sort((a, b) => b.visibleTokens.length - a.visibleTokens.length || byName(a, b));
  else if (mode === "score") rows.sort((a, b) => compareForSort(b.recordStats?.bestScore, a.recordStats?.bestScore) || byName(a, b));
  else rows.sort(byName);
}

function renderTagsFacets(facetCounts) {
  const query = tagsFacetSearchInput.value.trim().toLocaleLowerCase("ko");
  const entries = [...facetCounts.entries()]
    .filter(([label]) => !query || label.toLocaleLowerCase("ko").includes(query))
    .sort((a, b) => Number(state.tagsSelected.has(b[0])) - Number(state.tagsSelected.has(a[0])) || b[1] - a[1] || a[0].localeCompare(b[0], "ko"));
  const visible = entries.slice(0, 200);
  tagsFacetList.innerHTML = visible.length
    ? visible.map(([label, count]) => `<button class="tagFacetChip${state.tagsSelected.has(label) ? " active" : ""}" type="button" data-tag-value="${encodeURIComponent(label)}"><span>${escapeHtml(label)}</span><b>${count}</b></button>`).join("")
    : `<span class="tagsEmpty">조건에 맞는 태그가 없습니다.</span>`;
}

function renderTagsTable(rows) {
  const limit = Number(limitSelect.value);
  const visibleRows = limit > 0 ? rows.slice(0, limit) : rows;
  const selectedButton = buttonFilter.value;
  const scHeader = selectedButton ? `<th class="tagScLevelHead">${selectedButton}B SC</th><th class="tagScFloorHead">서열표</th>` : "";
  const header = `<thead><tr><th class="tagSongHead">곡</th>${scHeader}<th class="tagBpmHead">BPM</th><th class="tagGenreHead">장르</th><th class="tagAliasHead">별칭</th><th class="tagRecordHead">내 기록</th></tr></thead>`;
  const columnCount = selectedButton ? 7 : 5;
  if (!visibleRows.length) {
    tagsTable.innerHTML = `${header}<tbody><tr><td class="empty" colspan="${columnCount}">조건에 맞는 곡이 없습니다.</td></tr></tbody>`;
    return;
  }
  const body = visibleRows.map((row) => {
    const stats = row.recordStats;
    const recordLabel = stats
      ? `<strong>${stats.count}개</strong><span>최고 ${Number.isFinite(stats.bestScore) ? stats.bestScore.toFixed(2) : "-"}</span><small>${[...stats.buttons].sort().map((button) => `${button}B`).join(" · ")}</small>`
      : `<span class="muted">기록 없음</span>`;
    const tokenHtml = row.visibleTokens.length
      ? row.visibleTokens.map((token) => `<span class="songTag${state.tagsSelected.has(token.label) ? " selected" : ""}"${token.color ? ` style="--tag-color:${escapeHtml(token.color)}"` : ""}>${token.scope === "GENERAL" ? "" : `<small>${escapeHtml(token.scope)}</small>`}${escapeHtml(token.label)}${token.pattern ? `<small>${escapeHtml(token.pattern)}</small>` : ""}${token.weight ? `<b>${escapeHtml(token.weight)}</b>` : ""}</span>`).join("")
      : `<span class="muted">표시할 태그 없음</span>`;
    const scLevelCell = selectedButton
      ? `<td class="tagScLevelCell">${escapeHtml(row.scLevels?.[selectedButton] ?? "-")}</td><td class="tagScFloorCell">${escapeHtml(row.scFloorNames?.[selectedButton] ?? "-")}</td>`
      : "";
    return `<tr>
      <td class="tagSongCell"><div class="tagSongTitleRow"><strong>${escapeHtml(row.name)}</strong><div class="songTags">${tokenHtml}</div></div><span>#${row.title} · ${escapeHtml(row.composer)}${row.dlcCode ? ` · ${escapeHtml(row.dlcCode)}` : ""}</span></td>
      ${scLevelCell}
      <td class="num">${escapeHtml(row.bpmText || "-")}</td>
      <td>${escapeHtml(row.genre || "-")}</td>
      <td class="tagAliasCell">${escapeHtml(row.aka || "-")}</td>
      <td class="tagRecordCell">${recordLabel}</td>
    </tr>`;
  }).join("");
  tagsTable.innerHTML = `${header}<tbody>${body}</tbody>`;
}

function getCurrentNickname() {
  return (nicknameInput.value || "").trim();
}

function saveCurrentNickname(nickname) {
  const settings = loadSettings();
  settings.nickname = (nickname || "").trim();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function getNicknameHistory() {
  try {
    const nicknames = JSON.parse(localStorage.getItem(NICKNAME_HISTORY_KEY) || "[]");
    return Array.isArray(nicknames) ? nicknames.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function rememberNickname(nickname) {
  const clean = (nickname || "").trim();
  if (!clean) return;
  const next = [clean, ...getNicknameHistory().filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
  localStorage.setItem(NICKNAME_HISTORY_KEY, JSON.stringify(next));
  saveCurrentNickname(clean);
  renderRecentNicknames();
}

function renderRecentNicknames() {
  const nicknames = getNicknameHistory();
  recentNicknamesEl.innerHTML = nicknames
    .map((nickname) => `<button class="nicknameChip" type="button" data-nickname="${escapeHtml(nickname)}">${escapeHtml(nickname)}</button>`)
    .join("");
  recentNicknamesEl.querySelectorAll(".nicknameChip").forEach((button) => {
    button.addEventListener("click", () => {
      nicknameInput.value = button.dataset.nickname || "";
      applyNickname();
    });
  });
}

async function applyNickname() {
  const nickname = getCurrentNickname();
  if (!nickname) {
    statusText.textContent = "닉네임을 입력해 주세요.";
    nicknameInput.focus();
    return;
  }
  rememberNickname(nickname);
  await refresh(false);
}

async function disconnectHistoryAccountForNickname(nickname) {
  const nextNickname = cacheKey(nickname);
  const invoke = window.__TAURI__?.core?.invoke;
  if (!state.historyAccountNickname) {
    if (invoke) historyAccountStatus.textContent = `${nickname} 계정 재연결 필요`;
    return;
  }
  if (state.historyAccountNickname === nextNickname) return;
  if (invoke) await invoke("logout_history_account");
  state.historyAccountNickname = "";
  state.historyPendingAccount = null;
  historyAccountToken.value = "";
  historyAccountStatus.textContent = `${nickname} 계정 재연결 필요`;
  historyAccountStatus.title = "닉네임이 변경되어 기존 로그인 세션을 해제했습니다.";
}

function setIfOptionExists(select, value) {
  const exists = Array.from(select.options).some((option) => option.value === value);
  if (exists) select.value = value;
}

async function serverRefreshLegacy(full) {
  const nickname = getCurrentNickname();
  if (!nickname) {
    statusText.textContent = "닉네임을 입력해 주세요.";
    nicknameInput.focus();
    return;
  }
  rememberNickname(nickname);
  setBusy(true, full ? "전체 새로고침 중" : "새로고침 중");
  try {
    const params = new URLSearchParams({ nickname });
    if (full) params.set("full", "1");
    const response = await fetch(`/api/refresh?${params.toString()}`, { method: "POST" });
    const payload = await response.json();
    if (!response.ok || payload.ok === false) throw new Error(payload.message || "새로고침 실패");
    state.payload = payload;
    render();
  } catch (error) {
    statusText.textContent = `오류: ${error.message}`;
    try {
      const params = new URLSearchParams({ nickname });
      state.payload = await fetch(`/api/data?${params.toString()}`).then((res) => res.json());
      render();
    } catch {
      tableEl.innerHTML = `<tbody><tr><td class="empty">표시할 캐시 데이터가 없습니다.</td></tr></tbody>`;
    }
  } finally {
    setBusy(false);
  }
}

async function refresh(full) {
  const nickname = getCurrentNickname();
  if (!nickname) {
    statusText.textContent = "닉네임을 입력해 주세요.";
    nicknameInput.focus();
    return;
  }
  try {
    await disconnectHistoryAccountForNickname(nickname);
  } catch (error) {
    statusText.textContent = `히스토리 계정 연결 해제 실패: ${String(error)}`;
    return;
  }
  rememberNickname(nickname);
  setBusy(true, full ? "전체 새로고침 중" : "새로고침 중");
  try {
    state.payload = await fetchArchive(nickname, full);
    await refreshTop50ScaleCache(full);
    render();
    await completePendingHistoryAccount();
    await reconnectConfiguredHistoryAccount();
  } catch (error) {
    statusText.textContent = `오류: ${error.message}`;
    try {
      state.payload = await loadCachedPayload(nickname);
      render();
      await completePendingHistoryAccount();
      await reconnectConfiguredHistoryAccount();
    } catch {
      tableEl.innerHTML = `<tbody><tr><td class="empty">표시할 캐시 데이터가 없습니다.</td></tr></tbody>`;
    }
  } finally {
    setBusy(false);
  }
}

async function loadComparison(full = false) {
  const compareNickname = compareNicknameInput.value.trim();
  if (!compareNickname) {
    statusText.textContent = "비교 닉네임을 입력해 주세요.";
    compareNicknameInput.focus();
    return;
  }
  saveSettings();
  setBusy(true, `비교 기록 불러오는 중: ${compareNickname}`);
  try {
    state.comparePayload = await fetchArchive(compareNickname, full);
    viewSelect.value = "compare";
    state.view = "compare";
    saveSettings();
    render();
  } catch (error) {
    statusText.textContent = `비교 오류: ${error.message}`;
    try {
      state.comparePayload = await loadCachedPayload(compareNickname);
      viewSelect.value = "compare";
      state.view = "compare";
      render();
    } catch {
      tableEl.innerHTML = `<tbody><tr><td class="empty">비교 대상 캐시 데이터가 없습니다.</td></tr></tbody>`;
    }
  } finally {
    setBusy(false);
  }
}

async function fetchArchive(nickname, forceFullRefresh = false) {
  const cache = await loadProfileCache(nickname);
  const cachedRecords = Array.isArray(cache.records) ? cache.records : [];
  const cachedTiers = Array.isArray(cache.tiers) ? cache.tiers : [];
  const cachedDjClasses = Array.isArray(cache.djClasses) ? cache.djClasses : [];
  const cachedState = cache.state || {};
  const since = forceFullRefresh ? null : cachedRecords.length ? cachedState.lastRecordSyncAt : null;
  const syncStartedAt = utcNowIso();

  const { records: recordUpdates, errors: recordErrors } = await fetchRecords(nickname, since);
  const records = forceFullRefresh && !recordErrors.length ? recordUpdates : mergeRecords(cachedRecords, recordUpdates);
  const statsNeeded = forceFullRefresh || !cachedTiers.length || !cachedDjClasses.length || recordUpdates.length > 0 || !since;
  let tiers = cachedTiers;
  let djClasses = cachedDjClasses;
  let statsErrors = [];

  if (statsNeeded) {
    const stats = await fetchStats(nickname);
    tiers = stats.tiers;
    djClasses = stats.djClasses;
    statsErrors = stats.errors;
  }

  const errors = [...recordErrors, ...statsErrors];
  const nextState = {
    ...cachedState,
    nickname,
    lastRunAt: utcNowIso(),
    lastSince: since,
    lastUpdatedRecords: recordUpdates.length,
    lastForceFullRefresh: forceFullRefresh,
  };

  if (!recordErrors.length) {
    nextState.lastRecordSyncAt = syncStartedAt;
    cache.records = records;
  }
  if (!statsErrors.length && statsNeeded) {
    cache.tiers = tiers;
    cache.djClasses = djClasses;
  }
  cache.nickname = nickname;
  cache.state = nextState;
  await saveProfileCache(nickname, cache);

  return buildPayload(nickname, records, tiers, djClasses, errors, {
    since: since || "full",
    updatedRecords: recordUpdates.length,
    usedRecordCache: cachedRecords.length > 0,
    usedStatsCache: !statsNeeded,
    forceFullRefresh,
    lastRecordSyncAt: nextState.lastRecordSyncAt || "",
  });
}

async function loadCachedPayload(nickname) {
  const cache = await loadProfileCache(nickname);
  const records = Array.isArray(cache.records) ? cache.records : [];
  const tiers = Array.isArray(cache.tiers) ? cache.tiers : [];
  const djClasses = Array.isArray(cache.djClasses) ? cache.djClasses : [];
  const cachedState = cache.state || {};
  if (!records.length && !tiers.length && !djClasses.length) throw new Error("No cache");
  return buildPayload(nickname, records, tiers, djClasses, [], {
    since: cachedState.lastSince || "cache",
    updatedRecords: cachedState.lastUpdatedRecords ?? "",
    usedRecordCache: true,
    usedStatsCache: true,
    forceFullRefresh: cachedState.lastForceFullRefresh || false,
    lastRecordSyncAt: cachedState.lastRecordSyncAt || "",
  });
}

async function fetchRecords(nickname, since) {
  const records = [];
  const errors = [];
  for (const button of BUTTONS) {
    const query = since ? { since } : null;
    const { data, error } = await requestJson(`/api/v2/archive/${encodeURIComponent(nickname)}/button/${button}`, query);
    if (error) {
      errors.push({ ...error, category: "records", button });
    } else if (data?.success) {
      for (const item of data.records || []) records.push({ ...item, button });
    } else {
      errors.push({ category: "records", button, url: `/archive/${nickname}/button/${button}`, status: "API", message: JSON.stringify(data) });
    }
    await delay(150);
  }
  return { records, errors };
}

async function fetchStats(nickname) {
  const tiers = [];
  const djClasses = [];
  const errors = [];
  for (const button of BUTTONS) {
    const tier = await requestJson(`/api/v2/archive/${encodeURIComponent(nickname)}/tier/${button}`);
    if (tier.error) errors.push({ ...tier.error, category: "tier", button });
    else if (tier.data?.success) tiers.push({ ...tier.data, button });
    else errors.push({ category: "tier", button, url: `/archive/${nickname}/tier/${button}`, status: "API", message: JSON.stringify(tier.data) });

    const djClass = await requestJson(`/api/v2/archive/${encodeURIComponent(nickname)}/djClass/${button}`);
    if (djClass.error) errors.push({ ...djClass.error, category: "djClass", button });
    else if (djClass.data?.success) djClasses.push({ ...djClass.data, button });
    else errors.push({ category: "djClass", button, url: `/archive/${nickname}/djClass/${button}`, status: "API", message: JSON.stringify(djClass.data) });
    await delay(150);
  }
  return { tiers, djClasses, errors };
}

async function requestJson(path, query = null) {
  const url = new URL(path, API_BASE_URL);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") url.searchParams.set(key, value);
    });
  }
  try {
    const response = await fetch(url.toString());
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return { data: null, error: { category: "parse", button: "-", url: url.toString(), status: "JSON", message: text.slice(0, 300) } };
    }
    if (!response.ok) {
      return { data: null, error: { category: "http", button: "-", url: url.toString(), status: response.status, message: data?.message || data?.error || response.statusText } };
    }
    return { data, error: null };
  } catch (error) {
    return { data: null, error: { category: "network", button: "-", url: url.toString(), status: "NETWORK", message: error.message } };
  }
}

function buildPayload(nickname, records, tiers, djClasses, errors, syncInfo) {
  return {
    ok: errors.length === 0,
    nickname,
    generatedAt: utcNowIso(),
    sync: syncInfo,
    summary: buildSummary(records, tiers, djClasses, errors),
    records,
    floorMinScore: buildFloorMinScore(records),
    tiers: normalizeTiers(tiers),
    djClasses,
    errors,
  };
}

function buildSummary(records, tiers, djClasses, errors) {
  const byButton = {};
  for (const button of BUTTONS) {
    const buttonRecords = records.filter((record) => Number(record.button) === button);
    const scores = buttonRecords.map((record) => Number(record.score)).filter(Number.isFinite);
    byButton[String(button)] = {
      records: buttonRecords.length,
      minScore: scores.length ? Math.min(...scores) : null,
      avgScore: scores.length ? round(scores.reduce((sum, score) => sum + score, 0) / scores.length, 4) : null,
      maxCombo: buttonRecords.filter((record) => record.maxCombo === true).length,
    };
  }
  return {
    records: records.length,
    tiers: tiers.length,
    djClasses: djClasses.length,
    errors: errors.length,
    byButton,
  };
}

function buildFloorMinScore(records) {
  const minByFloor = new Map();
  for (const record of records) {
    if (record.button === undefined || record.floor === undefined || !Number.isFinite(Number(record.score))) continue;
    const key = `${record.button}|${record.floor}`;
    const score = Number(record.score);
    if (!minByFloor.has(key) || score < minByFloor.get(key)) minByFloor.set(key, score);
  }
  return records
    .filter((record) => {
      const key = `${record.button}|${record.floor}`;
      return minByFloor.has(key) && Number(record.score) === minByFloor.get(key);
    })
    .map((record) => ({
      button: record.button,
      title: record.title,
      floor: record.floor,
      score: record.score,
      floorName: record.floorName,
      name: record.name,
      pattern: record.pattern,
      level: record.level,
      maxCombo: record.maxCombo,
      updatedAt: record.updatedAt,
    }))
    .sort((a, b) => compare(a.button, b.button) || compare(a.floor, b.floor) || compare(a.score, b.score) || compare(a.name, b.name));
}

function normalizeTiers(tiers) {
  return tiers.map((row) => {
    const tier = row.tier || {};
    const nextTier = row.next || {};
    return {
      button: row.button,
      userNo: row.userNo,
      nickname: row.nickname,
      top50sum: row.top50sum,
      tierPoint: row.tierPoint,
      tierName: tier.name,
      tierCode: tier.code,
      nextRating: nextTier.rating,
      nextTierName: nextTier.name,
      nextTierCode: nextTier.code,
    };
  });
}

function recordKey(record) {
  return `${record.button ?? ""}|${record.title ?? ""}|${record.pattern ?? ""}`;
}

function mergeRecords(cachedRecords, updates) {
  const merged = new Map(cachedRecords.map((record) => [recordKey(record), { ...record }]));
  for (const record of updates) merged.set(recordKey(record), { ...record });
  return [...merged.values()].sort((a, b) => compare(a.button, b.button) || compare(a.title, b.title) || compare(a.pattern, b.pattern));
}

async function loadProfileCache(nickname) {
  const db = await openCacheDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(PROFILE_STORE, "readonly").objectStore(PROFILE_STORE).get(cacheKey(nickname));
    request.onsuccess = () => resolve(request.result || { nickname, records: [], tiers: [], djClasses: [], state: {} });
    request.onerror = () => reject(request.error);
  });
}

async function saveProfileCache(nickname, cache) {
  const db = await openCacheDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(PROFILE_STORE, "readwrite").objectStore(PROFILE_STORE).put({ ...cache, id: cacheKey(nickname), nickname });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function loadRecordHistories(nickname) {
  const db = await openCacheDb();
  return new Promise((resolve, reject) => {
    const store = db.transaction(HISTORY_STORE, "readonly").objectStore(HISTORY_STORE);
    const request = store.index("nickname").getAll(cacheKey(nickname));
    request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
    request.onerror = () => reject(request.error);
  });
}

async function saveRecordHistory(entry) {
  const db = await openCacheDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(HISTORY_STORE, "readwrite").objectStore(HISTORY_STORE).put(entry);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function deleteRecordHistories(nickname) {
  const db = await openCacheDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HISTORY_STORE, "readwrite");
    const index = transaction.objectStore(HISTORY_STORE).index("nickname");
    const request = index.openCursor(IDBKeyRange.only(cacheKey(nickname)));
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      cursor.delete();
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

function openCacheDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROFILE_STORE)) db.createObjectStore(PROFILE_STORE, { keyPath: "id" });
      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        const store = db.createObjectStore(HISTORY_STORE, { keyPath: "id" });
        store.createIndex("nickname", "nickname", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function cacheKey(nickname) {
  return (nickname || "").trim().toLowerCase();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function utcNowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function round(value, digits) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function setBusy(isBusy, text = "") {
  refreshButton.disabled = isBusy;
  fullRefreshButton.disabled = isBusy;
  nicknameApplyButton.disabled = isBusy;
  nicknameInput.disabled = isBusy;
  compareLoadButton.disabled = isBusy;
  compareNicknameInput.disabled = isBusy;
  if (isBusy) statusText.textContent = text;
}

function render() {
  if (!state.payload) return;
  renderActiveView();
  const sync = state.payload.sync || {};
  const mode = sync.forceFullRefresh ? "전체" : sync.since === "full" ? "전체" : "증분";
  statusText.textContent = `${state.payload.nickname} · ${mode} 갱신 · 업데이트 ${sync.updatedRecords ?? 0}건 · ${formatDate(state.payload.generatedAt)}`;
}

function renderActiveView() {
  const isChart = viewSelect.value === "chart";
  const isCompare = viewSelect.value === "compare";
  const isHistory = viewSelect.value === "history";
  const isAchievements = viewSelect.value === "achievements";
  const isSelfCompare = viewSelect.value === "selfCompare";
  const isTags = viewSelect.value === "tags";
  const isDebug = viewSelect.value === "debug";
  const isReadme = viewSelect.value === "readme";
  const isOverview = viewSelect.value === "summaryInfo";
  [
    [chartPanel, !isChart],
    [compareChartPanel, !isCompare],
    [historyPanel, !isHistory],
    [achievementPanel, !isAchievements],
    [selfComparePanel, !isSelfCompare],
    [tagsPanel, !isTags],
    [debugPanel, !isDebug],
    [readmePanel, !isReadme],
    [overviewPanel, !isOverview],
    [tableSection, isChart || isOverview || isDebug || isReadme || isTags || isAchievements],
  ].forEach(([element, hidden]) => {
    if (element) element.hidden = hidden;
  });
  updateCompareControls();
  hideTooltip();
  hideCompareChartTooltip();
  hideHistoryTooltip();
  if (isChart) renderChart();
  else if (isHistory) renderHistoryView();
  else if (isAchievements) {
    achievementStatus.textContent = "최근 성과를 불러오는 중입니다...";
    achievementList.innerHTML = `<div class="achievementEmpty">히스토리 캐시를 확인하고 있습니다.</div>`;
    renderAchievementView();
  }
  else if (isSelfCompare) renderSelfCompareView();
  else if (isTags) renderTagsView();
  else if (isDebug) renderDebugView();
  else if (isOverview) renderOverview();
  else if (isReadme) return;
  else {
    if (isCompare) renderCompareChart();
    renderTable();
  }
}

function renderCompareChart() {
  if (!state.payload || viewSelect.value !== "compare") return;
  const metric = getCompareChartMetric();
  const rows = filterRows(buildCompareRows())
    .map((row) => ({ ...row, xValue: row[metric.mineKey], yValue: row[metric.otherKey] }))
    .filter((row) => Number.isFinite(row.xValue) && Number.isFinite(row.yValue));
  const mineName = state.payload.nickname || "내 계정";
  const otherName = state.comparePayload?.nickname || "비교 계정";
  const vectorMode = compareChartModeSelect.value === "vector";
  compareScatterChart.classList.toggle("compareChartSquare", !vectorMode);
  compareScatterChart.classList.toggle("compareChartVector", vectorMode);
  compareChartTitle.textContent = `${metric.label} ${vectorMode ? "차이-합 벡터" : "계정 비교"}`;
  compareChartDescription.textContent = vectorMode
    ? `오른쪽 ${mineName} 우위 · 왼쪽 ${otherName} 우위 · 위쪽 합산 수준 · 공통 기록 ${rows.length}개`
    : `X축 ${mineName} · Y축 ${otherName} · 공통 기록 ${rows.length}개`;

  const clientWidth = compareScatterChart.clientWidth || 760;
  const size = Math.max(560, Math.min(860, clientWidth));
  const width = vectorMode ? Math.max(760, clientWidth) : size;
  const height = vectorMode ? Math.max(480, Math.min(680, Math.round(width * 0.62))) : size;
  const pad = vectorMode ? { left: 74, right: 74, top: 36, bottom: 62 } : { left: 78, right: 30, top: 30, bottom: 78 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  if (!rows.length) {
    compareScatterChart.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="계정 비교 산포도"><rect class="chartBg" width="${width}" height="${height}"></rect><text class="emptyText" x="${width / 2}" y="${height / 2}">표시할 공통 기록이 없습니다.</text></svg>`;
    return;
  }

  const values = rows.flatMap((row) => [row.xValue, row.yValue]);
  const autoRange = getCompareChartRange(values, metric.key);
  let range = autoRange;
  if (compareChartAutoInput.checked) {
    compareChartMinInput.value = formatCompareRangeInput(autoRange.min);
    compareChartMaxInput.value = formatCompareRangeInput(autoRange.max);
  } else {
    const manualMin = Number(compareChartMinInput.value);
    const manualMax = Number(compareChartMaxInput.value);
    if (Number.isFinite(manualMin) && Number.isFinite(manualMax) && manualMax > manualMin) range = { min: manualMin, max: manualMax };
  }
  if (vectorMode) {
    renderCompareVectorChart({ rows, metric, mineName, otherName, range, width, height, pad, plotW, plotH });
    return;
  }
  const xFor = (value) => pad.left + ((value - range.min) / (range.max - range.min)) * plotW;
  const yFor = (value) => pad.top + (1 - (value - range.min) / (range.max - range.min)) * plotH;
  const ticks = Array.from({ length: 6 }, (_, index) => range.min + ((range.max - range.min) * index) / 5);
  const grid = ticks.map((value) => {
    const x = xFor(value);
    const y = yFor(value);
    const label = formatCompareChartAxis(value, metric.key);
    return `<line class="gridLine" x1="${x}" y1="${pad.top}" x2="${x}" y2="${pad.top + plotH}"></line>
      <line class="gridLine" x1="${pad.left}" y1="${y}" x2="${pad.left + plotW}" y2="${y}"></line>
      <text class="tickLabel" x="${x}" y="${height - 42}" text-anchor="middle">${label}</text>
      <text class="tickLabel" x="${pad.left - 12}" y="${y + 4}" text-anchor="end">${label}</text>`;
  }).join("");
  const visibleRows = rows.filter((row) => row.xValue >= range.min && row.xValue <= range.max && row.yValue >= range.min && row.yValue <= range.max);
  const floorTrend = buildCompareFloorTrend(visibleRows, (center) => ({ x: xFor(center.xValue), y: yFor(center.yValue) }), { metric, mineName, otherName });
  const points = visibleRows.map((row) => {
    const diff = row.xValue - row.yValue;
    const className = Math.abs(diff) < 1e-9 ? "compareTiePoint" : diff > 0 ? "compareMinePoint" : "compareOtherPoint";
    const info = encodeURIComponent(JSON.stringify({
      name: row.name,
      pattern: row.pattern,
      level: row.level,
      floor: row.floorName,
      metric: metric.label,
      metricKey: metric.key,
      mineName,
      otherName,
      mineValue: row.xValue,
      otherValue: row.yValue,
      diff,
    }));
    return `<circle class="chartDot compareChartPoint ${className}" cx="${xFor(row.xValue).toFixed(2)}" cy="${yFor(row.yValue).toFixed(2)}" r="4.2" data-info="${info}" tabindex="0"></circle>`;
  }).join("");
  compareScatterChart.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(metric.label)} 계정 비교 산포도">
    <defs><clipPath id="comparePlotClip"><rect x="${pad.left}" y="${pad.top}" width="${plotW}" height="${plotH}"></rect></clipPath></defs>
    <rect class="chartBg" width="${width}" height="${height}"></rect>
    ${grid}
    <g clip-path="url(#comparePlotClip)">
      <line class="compareEqual" x1="${xFor(range.min)}" y1="${yFor(range.min)}" x2="${xFor(range.max)}" y2="${yFor(range.max)}"></line>
      ${points}
      ${floorTrend}
    </g>
    <text class="axisTitle" x="16" y="18">${escapeHtml(otherName)} · ${escapeHtml(metric.label)}</text>
    <text class="axisTitle" x="${width - 210}" y="${height - 14}">${escapeHtml(mineName)} · ${escapeHtml(metric.label)}</text>
  </svg>`;
  bindCompareChartTooltips();
}

function renderCompareVectorChart({ rows, metric, mineName, otherName, range, width, height, pad, plotW, plotH }) {
  const origin = { x: pad.left + plotW / 2, y: pad.top + plotH };
  const a = plotW / 2;
  const b = plotH / 2;
  const span = range.max - range.min;
  const normalized = (value) => (value - range.min) / span;
  const pointFor = (mine, other) => ({
    x: origin.x + a * (mine - other),
    y: origin.y - b * (mine + other),
  });
  const bottom = pointFor(0, 0);
  const right = pointFor(1, 0);
  const top = pointFor(1, 1);
  const left = pointFor(0, 1);
  const ticks = Array.from({ length: 6 }, (_, index) => ({
    ratio: index / 5,
    value: range.min + (span * index) / 5,
  }));
  const grid = ticks.map(({ ratio, value }, index) => {
    const mineStart = pointFor(ratio, 0);
    const mineEnd = pointFor(ratio, 1);
    const otherStart = pointFor(0, ratio);
    const otherEnd = pointFor(1, ratio);
    const label = formatCompareChartAxis(value, metric.key);
    return `<line class="gridLine" x1="${mineStart.x}" y1="${mineStart.y}" x2="${mineEnd.x}" y2="${mineEnd.y}"></line>
      <line class="gridLine" x1="${otherStart.x}" y1="${otherStart.y}" x2="${otherEnd.x}" y2="${otherEnd.y}"></line>
      <text class="compareVectorLabel" x="${mineStart.x + 8}" y="${mineStart.y + 18}" text-anchor="start">${label}</text>
      ${index === 0 ? "" : `<text class="compareVectorLabel" x="${otherStart.x - 8}" y="${otherStart.y + 18}" text-anchor="end">${label}</text>`}`;
  }).join("");
  const visibleRows = rows.filter((row) => row.xValue >= range.min && row.xValue <= range.max && row.yValue >= range.min && row.yValue <= range.max);
  const floorTrend = buildCompareFloorTrend(visibleRows, (center) => pointFor(normalized(center.xValue), normalized(center.yValue)), { metric, mineName, otherName });
  const points = visibleRows.map((row) => {
    const point = pointFor(normalized(row.xValue), normalized(row.yValue));
    const diff = row.xValue - row.yValue;
    const className = Math.abs(diff) < 1e-9 ? "compareTiePoint" : diff > 0 ? "compareMinePoint" : "compareOtherPoint";
    const info = encodeURIComponent(JSON.stringify({
      name: row.name,
      pattern: row.pattern,
      level: row.level,
      floor: row.floorName,
      metric: metric.label,
      metricKey: metric.key,
      mineName,
      otherName,
      mineValue: row.xValue,
      otherValue: row.yValue,
      diff,
    }));
    return `<circle class="chartDot compareChartPoint ${className}" cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="4.2" data-info="${info}" tabindex="0"></circle>`;
  }).join("");
  compareScatterChart.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(metric.label)} 차이-합 벡터 비교">
    <defs><clipPath id="compareVectorClip"><polygon points="${bottom.x},${bottom.y} ${right.x},${right.y} ${top.x},${top.y} ${left.x},${left.y}"></polygon></clipPath></defs>
    <rect class="chartBg" width="${width}" height="${height}"></rect>
    <polygon class="compareVectorBoundary" points="${bottom.x},${bottom.y} ${right.x},${right.y} ${top.x},${top.y} ${left.x},${left.y}"></polygon>
    ${grid}
    <line class="compareVectorMineAxis" x1="${bottom.x}" y1="${bottom.y}" x2="${right.x}" y2="${right.y}"></line>
    <line class="compareVectorOtherAxis" x1="${bottom.x}" y1="${bottom.y}" x2="${left.x}" y2="${left.y}"></line>
    <line class="compareEqual" x1="${bottom.x}" y1="${bottom.y}" x2="${top.x}" y2="${top.y}"></line>
    <g clip-path="url(#compareVectorClip)">${points}${floorTrend}</g>
    <text class="axisTitle" x="${right.x - 4}" y="${right.y - 14}" text-anchor="end">${escapeHtml(mineName)}</text>
    <text class="axisTitle" x="${left.x + 4}" y="${left.y - 14}" text-anchor="start">${escapeHtml(otherName)}</text>
    <text class="axisTitle" x="${top.x}" y="${top.y - 14}" text-anchor="middle">합산 수준</text>
  </svg>`;
  bindCompareChartTooltips();
}

function buildCompareFloorTrend(rows, pointFor, { metric, mineName, otherName }) {
  const grouped = new Map();
  for (const row of rows) {
    const floor = row.floorName;
    if (floorIndex(floor) < 0) continue;
    if (!grouped.has(floor)) grouped.set(floor, { floor, xTotal: 0, yTotal: 0, count: 0 });
    const group = grouped.get(floor);
    group.xTotal += row.xValue;
    group.yTotal += row.yValue;
    group.count += 1;
  }
  const centers = [...grouped.values()]
    .sort((a, b) => floorIndex(a.floor) - floorIndex(b.floor))
    .map((group) => ({
      floor: group.floor,
      xValue: group.xTotal / group.count,
      yValue: group.yTotal / group.count,
    }))
    .map((center) => ({ ...center, ...pointFor(center) }));
  if (!centers.length) return "";
  const line = centers.length > 1
    ? `<polyline class="compareFloorTrend" fill="none" points="${centers.map((center) => `${center.x.toFixed(2)},${center.y.toFixed(2)}`).join(" ")}"></polyline>`
    : "";
  const markers = centers.map((center) => {
    const info = encodeURIComponent(JSON.stringify({
      kind: "floorMidpoint",
      floor: center.floor,
      count: grouped.get(center.floor).count,
      metricKey: metric.key,
      metric: metric.label,
      mineName,
      otherName,
      mineValue: center.xValue,
      otherValue: center.yValue,
      diff: center.xValue - center.yValue,
    }));
    return `<circle class="compareFloorMidpoint" cx="${center.x.toFixed(2)}" cy="${center.y.toFixed(2)}" r="3.4" data-info="${info}" tabindex="0"></circle>`;
  }).join("");
  return line + markers;
}

function getCompareChartMetric() {
  if (compareChartMetricSelect.value === "logPower") return { key: "logPower", label: "logPower", mineKey: "mineLogPower", otherKey: "otherLogPower" };
  if (compareChartMetricSelect.value === "point") return { key: "point", label: "Point", mineKey: "minePoint", otherKey: "otherPoint" };
  return { key: "score", label: "Score", mineKey: "mineScore", otherKey: "otherScore" };
}

function getCompareChartRange(values, metricKey) {
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const baseSpan = rawMax - rawMin;
  const fallbackSpan = metricKey === "score" ? 0.1 : Math.max(Math.abs(rawMax) * 0.005, 0.02);
  const padding = Math.max(baseSpan * 0.02, fallbackSpan);
  let min = rawMin - padding;
  let max = rawMax + padding;
  if (metricKey === "score") {
    min = Math.max(0, min);
  } else {
    min = Math.max(0, min);
  }
  if (!(max > min)) max = min + fallbackSpan * 2;
  return { min, max };
}

function storeCompareChartRange(metricKey = state.compareChartMetric || compareChartMetricSelect.value) {
  if (!metricKey) return;
  state.compareChartRanges[metricKey] = {
    min: compareChartMinInput.value,
    max: compareChartMaxInput.value,
    auto: compareChartAutoInput.checked,
  };
}

function restoreCompareChartRange(metricKey) {
  const saved = state.compareChartRanges[metricKey] || {};
  compareChartMinInput.value = saved.min ?? "";
  compareChartMaxInput.value = saved.max ?? "";
  compareChartAutoInput.checked = saved.auto !== false;
  updateCompareChartRangeControls();
}

function updateCompareChartRangeControls() {
  compareChartMinInput.disabled = compareChartAutoInput.checked;
  compareChartMaxInput.disabled = compareChartAutoInput.checked;
}

function formatCompareRangeInput(value) {
  return Number(value.toFixed(4)).toString();
}

function formatCompareChartAxis(value, metricKey) {
  return metricKey === "score" ? value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "") : formatAxisValue(value);
}

function bindCompareChartTooltips() {
  compareScatterChart.querySelectorAll(".compareChartPoint, .compareFloorMidpoint").forEach((point) => {
    point.addEventListener("pointermove", (event) => showCompareChartTooltip(event, point.dataset.info));
    point.addEventListener("pointerenter", (event) => showCompareChartTooltip(event, point.dataset.info));
    point.addEventListener("focus", (event) => showCompareChartTooltip(event, point.dataset.info));
    point.addEventListener("pointerleave", hideCompareChartTooltip);
    point.addEventListener("blur", hideCompareChartTooltip);
  });
}

function showCompareChartTooltip(event, encodedInfo) {
  if (!encodedInfo) return;
  const info = JSON.parse(decodeURIComponent(encodedInfo));
  if (info.kind === "floorMidpoint") {
    compareChartTooltip.innerHTML = `<strong>floor ${escapeHtml(info.floor)} 중점</strong>
      <span>공통 기록 ${escapeHtml(info.count)}개 · ${escapeHtml(info.metric)} 평균</span>
      <span>${escapeHtml(info.mineName)} ${escapeHtml(formatCompareMetricValue(info.mineValue, info.metricKey))}</span>
      <span>${escapeHtml(info.otherName)} ${escapeHtml(formatCompareMetricValue(info.otherValue, info.metricKey))}</span>
      <span>차이 ${escapeHtml(formatSignedCompareMetric(info.diff, info.metricKey))}</span>`;
  } else {
    compareChartTooltip.innerHTML = `<strong>${escapeHtml(info.name)}</strong>
    <span>${escapeHtml(info.pattern)} · Lv.${escapeHtml(info.level)} · floor ${escapeHtml(info.floor)}</span>
    <span>${escapeHtml(info.mineName)} ${escapeHtml(formatCompareMetricValue(info.mineValue, info.metricKey))}</span>
    <span>${escapeHtml(info.otherName)} ${escapeHtml(formatCompareMetricValue(info.otherValue, info.metricKey))}</span>
    <span>차이 ${escapeHtml(formatSignedCompareMetric(info.diff, info.metricKey))}</span>`;
  }
  compareChartTooltip.hidden = false;
  const x = (event.clientX || window.innerWidth / 2) + 14;
  const y = (event.clientY || window.innerHeight / 2) + 14;
  compareChartTooltip.style.left = `${Math.max(12, Math.min(x, window.innerWidth - compareChartTooltip.offsetWidth - 12))}px`;
  compareChartTooltip.style.top = `${Math.max(12, Math.min(y, window.innerHeight - compareChartTooltip.offsetHeight - 12))}px`;
}

function formatCompareMetricValue(value, metricKey) {
  const digits = metricKey === "score" ? 4 : 2;
  return Number(value).toFixed(digits).replace(/0+$/, "").replace(/\.$/, "");
}

function formatSignedCompareMetric(value, metricKey) {
  const formatted = formatCompareMetricValue(value, metricKey);
  return Number(value) > 0 ? `+${formatted}` : formatted;
}

function hideCompareChartTooltip() {
  compareChartTooltip.hidden = true;
}

async function exportCompareChartImage() {
  const svg = compareScatterChart.querySelector("svg");
  if (!svg || !state.payload || !state.comparePayload) return;
  compareChartImageButton.disabled = true;
  setBusy(true, "비교 이미지 생성 중");
  try {
    hideCompareChartTooltip();
    const canvas = await drawCompareChartImage(svg);
    const mineName = state.payload.nickname || "mine";
    const otherName = state.comparePayload.nickname || "other";
    const safeNames = `${mineName}-${otherName}`.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-");
    const metric = compareChartMetricSelect.value;
    const mode = compareChartModeSelect.value;
    const copied = await saveCanvasImage(canvas, `v-archive-${safeNames}-${metric}-${mode}.png`);
    statusText.textContent = `비교 이미지를 다운로드했습니다.${copied ? " 클립보드에도 복사했습니다." : ""}`;
  } catch (error) {
    statusText.textContent = `비교 이미지 생성 오류: ${error.message || error}`;
  } finally {
    setBusy(false);
    compareChartImageButton.disabled = false;
  }
}

async function drawCompareChartImage(svg) {
  const sourceImage = await loadChartSvgImage(svg);
  const margin = 40;
  const width = 1440;
  const chartWidth = width - margin * 2;
  const viewBox = svg.viewBox.baseVal;
  const sourceWidth = viewBox?.width || 760;
  const sourceHeight = viewBox?.height || 760;
  const chartHeight = Math.round(chartWidth * sourceHeight / sourceWidth);
  const headerHeight = 112;
  const footerHeight = 86;
  const height = margin + headerHeight + chartHeight + footerHeight + margin;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const mineName = state.payload.nickname || "내 계정";
  const otherName = state.comparePayload.nickname || "비교 계정";
  const metric = getCompareChartMetric();
  const modeLabel = compareChartModeSelect.value === "vector" ? "차이-합 벡터" : "일반 XY";

  ctx.fillStyle = "#f4f6f8";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#171a1f";
  ctx.font = "700 30px Segoe UI, Malgun Gothic, Arial";
  ctx.fillText(`${mineName} vs ${otherName} · ${metric.label}`, margin, margin + 34);
  ctx.fillStyle = "#687282";
  ctx.font = "16px Segoe UI, Malgun Gothic, Arial";
  ctx.fillText(`${modeLabel} · 범위 ${compareChartMinInput.value} - ${compareChartMaxInput.value}`, margin, margin + 66);
  const version = document.querySelector('meta[name="v-archive-version"]')?.content || "local";
  ctx.textAlign = "right";
  ctx.fillText(`v${version} · ${formatDate(new Date().toISOString())}`, width - margin, margin + 66);
  ctx.textAlign = "left";

  ctx.drawImage(sourceImage, margin, margin + headerHeight, chartWidth, chartHeight);
  const legendY = margin + headerHeight + chartHeight + 42;
  drawCompareImageLegend(ctx, margin, legendY);
  return canvas;
}

function drawCompareImageLegend(ctx, x, y) {
  const entries = [
    ["#173f67", "내 우위"],
    ["#c03535", "상대 우위"],
    ["#687282", "동일 수치"],
  ];
  ctx.font = "15px Segoe UI, Malgun Gothic, Arial";
  let cursor = x;
  for (const [color, label] of entries) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cursor + 6, y - 5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#687282";
    ctx.fillText(label, cursor + 20, y);
    cursor += ctx.measureText(label).width + 58;
  }
}

async function loginHistoryAccount() {
  const invoke = window.__TAURI__?.core?.invoke;
  if (!invoke) return;
  const userNo = historyAccountUserNo.value.trim();
  const token = historyAccountToken.value.trim();
  if (!/^\d+$/.test(userNo) || !token) {
    historyAccountStatus.textContent = "회원 번호와 토큰을 입력하세요";
    return;
  }

  historyAccountLoginButton.disabled = true;
  try {
    await invoke("login_with_token", { userNo, token });
    historyAccountToken.value = "";
    const nickname = state.payload?.nickname || getCurrentNickname();
    state.historyAccountNickname = cacheKey(nickname);
    localStorage.setItem(HISTORY_ACCOUNT_NICKNAME_KEY, state.historyAccountNickname);
    historyAccountStatus.textContent = `회원 ${userNo} · ${nickname} 연결됨`;
    historyAccountStatus.title = "직접 입력한 계정으로 로그인했습니다.";
    statusText.textContent = "히스토리 계정 로그인이 완료되었습니다.";
  } catch (error) {
    historyAccountStatus.textContent = "계정 로그인 실패";
    statusText.textContent = `히스토리 계정 로그인 실패: ${String(error)}`;
  } finally {
    historyAccountLoginButton.disabled = false;
  }
}

async function selectAccountFile() {
  const invoke = window.__TAURI__?.core?.invoke;
  if (!invoke) return;

  historyAccountFileButton.disabled = true;
  try {
    const selected = await invoke("select_account_file");
    if (!selected) return;
    const account = await invoke("login_from_account_file");
    await connectVerifiedHistoryAccount(account);
    statusText.textContent = "account.txt를 연결하고 로그인했습니다.";
  } catch (error) {
    historyAccountStatus.textContent = "account.txt 연결 실패";
    historyAccountStatus.title = String(error);
    statusText.textContent = `account.txt 연결 실패: ${String(error)}`;
  } finally {
    historyAccountFileButton.disabled = false;
  }
}

function historyCacheId(nickname, record) {
  return `${cacheKey(nickname)}|${recordKey(record)}`;
}

function getHistoryTargets() {
  const records = state.payload?.records || [];
  const unique = new Map();
  for (const record of records) {
    if (!recordKey(record) || !getFloorLabel(record)) continue;
    if (!BUTTONS.includes(Number(record.button))) continue;
    if (!["NM", "HD", "MX", "SC"].includes(String(record.pattern))) continue;
    if (!Number.isFinite(Number(record.title))) continue;
    unique.set(recordKey(record), record);
  }
  return [...unique.values()];
}

function normalizeHistoryEvents(response, record) {
  const events = Array.isArray(response?.history) ? response.history : [];
  return events
    .map((event) => ({
      score: Number(event.score),
      maxCombo: event.maxCombo === true || Number(event.maxCombo) === 1,
      ymdt: event.ymdt || "",
    }))
    .filter((event) => Number.isFinite(event.score) && !Number.isNaN(new Date(event.ymdt).getTime()))
    .sort((a, b) => new Date(a.ymdt) - new Date(b.ymdt));
}

async function fetchHistoryWithRetry(invoke, record) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await invoke("fetch_record_history", {
        title: Number(record.title),
        button: Number(record.button),
        pattern: String(record.pattern),
      });
      if (response?.success !== true || !Array.isArray(response.history)) {
        throw new Error(`API 응답 오류: ${JSON.stringify(response).slice(0, 240)}`);
      }
      return { response, retryCount: attempt };
    } catch (error) {
      lastError = error;
      if (attempt < 2) await delay(1200 * (attempt + 1));
    }
  }
  throw lastError;
}

function adjustHistoryRequestDelay(currentDelay, { succeeded, retryCount = 0 }) {
  if (!succeeded) {
    return Math.min(HISTORY_REQUEST_DELAY_MAX, Math.max(HISTORY_REQUEST_DELAY_START, Math.round(currentDelay * 2)));
  }
  if (retryCount > 0) {
    const retryMultiplier = 1 + retryCount * 0.75;
    return Math.min(HISTORY_REQUEST_DELAY_MAX, Math.max(HISTORY_REQUEST_DELAY_START, Math.round(currentDelay * retryMultiplier)));
  }
  return Math.max(HISTORY_REQUEST_DELAY_MIN, Math.round(currentDelay * 0.94));
}

function setHistoryProgress(done, total) {
  const ratio = total > 0 ? Math.min(1, done / total) : 0;
  historyProgress.hidden = total === 0;
  historyProgressBar.style.width = `${(ratio * 100).toFixed(2)}%`;
}

async function collectRecordHistories(options = {}) {
  const invoke = window.__TAURI__?.core?.invoke;
  if (!invoke || state.historyCollecting || !state.payload) return;

  const nickname = state.payload.nickname || getCurrentNickname();
  if (state.historyAccountNickname !== cacheKey(nickname)) {
    historyStatus.textContent = `${nickname} 계정을 먼저 연결해주세요.`;
    return;
  }
  const targets = getHistoryTargets();
  state.historyCollecting = true;
  state.historyStopRequested = false;
  historyCollectButton.disabled = true;
  historyFullCollectButton.disabled = true;
  historyResetButton.disabled = true;
  historyStopButton.disabled = false;
  let completed = 0;
  let failed = 0;
  let requestDelay = HISTORY_REQUEST_DELAY_START;

  try {
    const existing = await loadRecordHistories(nickname);
    const existingById = new Map(existing.map((entry) => [entry.id, entry]));
    const queue = options.force ? targets : targets.filter((record) => {
      const cached = existingById.get(historyCacheId(nickname, record));
      return !cached || (record.updatedAt && cached.sourceUpdatedAt !== record.updatedAt);
    });
    const cachedCount = options.force ? 0 : targets.length - queue.length;

    if (!queue.length) {
      historyStatus.textContent = `${targets.length}개 패턴의 히스토리가 최신 상태입니다.`;
      setHistoryProgress(0, 0);
      await renderHistoryView();
      return;
    }

    setHistoryProgress(0, queue.length);
    for (const record of queue) {
      if (state.historyStopRequested) break;
      historyStatus.textContent = `수집 ${completed + 1}/${queue.length} · 캐시 ${cachedCount} · 실패 ${failed} · 간격 ${requestDelay}ms · ${record.button}B ${record.name || record.title} ${record.pattern}`;
      let succeeded = false;
      let retryCount = 0;
      try {
        const result = await fetchHistoryWithRetry(invoke, record);
        const response = result.response;
        retryCount = result.retryCount;
        const history = normalizeHistoryEvents(response, record);
        const entry = {
          id: historyCacheId(nickname, record),
          nickname: cacheKey(nickname),
          button: Number(record.button),
          title: record.title,
          name: record.name || "",
          pattern: record.pattern || "",
          level: record.level,
          floor: record.floor,
          floorName: getFloorLabel(record),
          sourceUpdatedAt: record.updatedAt || "",
          fetchedAt: utcNowIso(),
          history,
        };
        await saveRecordHistory(entry);
        succeeded = true;
      } catch (error) {
        failed += 1;
        console.error("History collection failed", recordKey(record), error);
      }
      requestDelay = adjustHistoryRequestDelay(requestDelay, { succeeded, retryCount });
      completed += 1;
      setHistoryProgress(completed, queue.length);
      if (completed % 10 === 0 && viewSelect.value === "history") await renderHistoryView();
      if (!state.historyStopRequested && completed < queue.length) await delay(requestDelay);
    }

    const stopped = state.historyStopRequested;
    historyStatus.textContent = `${stopped ? "수집 중지" : "수집 완료"} · 처리 ${completed}/${queue.length} · 기존 캐시 ${cachedCount} · 실패 ${failed}`;
    await renderHistoryView({ preserveStatus: true });
  } catch (error) {
    historyStatus.textContent = `히스토리 수집 오류: ${error}`;
  } finally {
    state.historyCollecting = false;
    state.historyStopRequested = false;
    historyCollectButton.disabled = false;
    historyFullCollectButton.disabled = false;
    historyResetButton.disabled = false;
    historyStopButton.disabled = true;
  }
}

async function resetRecordHistories() {
  if (!state.payload || state.historyCollecting) return;
  const nickname = state.payload.nickname || getCurrentNickname();
  if (!confirm(`${nickname}의 수집된 히스토리를 모두 초기화할까요?`)) return;
  historyResetButton.disabled = true;
  try {
    await deleteRecordHistories(nickname);
    state.historyEntries = [];
    state.historyRows = [];
    state.achievementRows = [];
    state.achievementSelected.clear();
    historyStartDate.value = "";
    historyEndDate.value = "";
    saveSettings();
    historyStatus.textContent = `${nickname}의 히스토리를 초기화했습니다.`;
    renderLogPowerHistoryChart([]);
    renderTable();
  } catch (error) {
    historyStatus.textContent = `히스토리 초기화 오류: ${error.message || error}`;
  } finally {
    historyResetButton.disabled = false;
  }
}

async function renderHistoryView(options = {}) {
  if (!state.payload) return;
  const renderToken = ++state.historyRenderToken;
  const nickname = state.payload.nickname || getCurrentNickname();
  try {
    const entries = await loadRecordHistories(nickname);
    if (renderToken !== state.historyRenderToken || viewSelect.value !== "history") return;
    const targetKeys = new Set(getHistoryTargets().map(recordKey));
    state.historyEntries = entries.filter((entry) => targetKeys.has(recordKey(entry)));
    updateHistoryRangeBounds(state.historyEntries);
    state.historyRows = buildHistoryRows(state.historyEntries, getHistoryTimeRange());
    if (!options.preserveStatus && !state.historyCollecting) {
      const eventCount = state.historyRows.length;
      historyStatus.textContent = `${state.historyEntries.length}/${targetKeys.size}개 패턴 · ${eventCount}개 기록`;
      setHistoryProgress(0, 0);
    }
    renderLogPowerHistoryChart(state.historyEntries);
    renderTable();
  } catch (error) {
    historyStatus.textContent = `히스토리 캐시 오류: ${error.message || error}`;
  }
}

async function renderAchievementView() {
  if (!state.payload || viewSelect.value !== "achievements") return;
  const renderToken = ++state.achievementRenderToken;
  const nickname = state.payload.nickname || getCurrentNickname();
  try {
    const entries = await loadRecordHistories(nickname);
    if (renderToken !== state.achievementRenderToken || viewSelect.value !== "achievements") return;
    const targetKeys = new Set(getHistoryTargets().map(recordKey));
    const available = entries.filter((entry) => targetKeys.has(recordKey(entry)));
    state.achievementRows = buildAchievementRows(available);
    const validIds = new Set(state.achievementRows.map((row) => row.id));
    for (const id of state.achievementSelected) {
      if (!validIds.has(id)) state.achievementSelected.delete(id);
    }
    renderAchievementList();
  } catch (error) {
    state.achievementRows = [];
    renderAchievementList();
    achievementStatus.textContent = `성과 히스토리 캐시 오류: ${error.message || error}`;
  }
}

function buildAchievementRows(entries) {
  const currentByKey = new Map((state.payload?.records || []).map((record) => [recordKey(record), record]));
  return entries.flatMap((entry) => {
    const source = currentByKey.get(recordKey(entry)) || entry;
    const floorName = getFloorLabel(source) || getFloorLabel(entry);
    const difficultyConstant = difficultyConstantForFloor(floorName, entry.button);
    if (!Number.isFinite(difficultyConstant)) return [];
    const history = [...(entry.history || [])].sort((a, b) => new Date(a.ymdt) - new Date(b.ymdt));
    const rows = [];
    for (let index = 1; index < history.length; index += 1) {
      const previous = history[index - 1];
      const current = history[index];
      const previousScore = Number(previous.score);
      const currentScore = Number(current.score);
      const scoreDiff = currentScore - previousScore;
      const gainedMaxCombo = previous.maxCombo !== true && current.maxCombo === true;
      if (!(scoreDiff > 0) && !gainedMaxCombo) continue;
      const previousScorePoint = scoreToPoint(previousScore);
      const currentScorePoint = scoreToPoint(currentScore);
      const previousLogPower = previousScorePoint * difficultyConstant;
      const currentLogPower = currentScorePoint * difficultyConstant;
      if (![previousLogPower, currentLogPower].every(Number.isFinite)) continue;
      rows.push({
        id: `${entry.id}|${current.ymdt}|${index}`,
        button: Number(entry.button),
        title: entry.title,
        name: source.name || entry.name || "",
        pattern: source.pattern || entry.pattern || "",
        level: source.level ?? entry.level ?? "",
        floorName,
        previousScore,
        currentScore,
        scoreDiff,
        previousScorePoint,
        currentScorePoint,
        scorePointDiff: currentScorePoint - previousScorePoint,
        previousLogPower,
        currentLogPower,
        logPowerDiff: currentLogPower - previousLogPower,
        previousMaxCombo: previous.maxCombo === true,
        currentMaxCombo: current.maxCombo === true,
        previousUpdatedAt: previous.ymdt,
        currentUpdatedAt: current.ymdt,
      });
    }
    return rows;
  }).sort((a, b) => new Date(b.currentUpdatedAt) - new Date(a.currentUpdatedAt) || b.scoreDiff - a.scoreDiff || compare(a.name, b.name));
}

function getFilteredAchievementRows() {
  const button = buttonFilter.value;
  const pattern = patternFilter.value;
  const query = searchInput.value.trim().toLowerCase();
  return state.achievementRows.filter((row) => {
    if (button && String(row.button) !== button) return false;
    if (pattern && row.pattern !== pattern) return false;
    if (query && !JSON.stringify(row).toLowerCase().includes(query)) return false;
    return true;
  });
}

function getVisibleAchievementRows() {
  const rows = getFilteredAchievementRows();
  const limit = Number(limitSelect.value);
  return limit > 0 ? rows.slice(0, limit) : rows;
}

function renderAchievementList() {
  const visibleRows = getVisibleAchievementRows();
  updateAchievementSelectionControls(visibleRows);
  achievementStatus.textContent = state.achievementRows.length
    ? `최근 등록순 ${state.achievementRows.length}개 성과 · History에서 수집된 인접 기록 비교`
    : "비교할 이전 기록이 없습니다. History 탭에서 히스토리를 먼저 수집해 주세요.";
  if (!visibleRows.length) {
    achievementList.innerHTML = `<div class="achievementEmpty">조건에 맞는 최근 성과가 없습니다.</div>`;
    return;
  }
  achievementList.innerHTML = visibleRows.map((row) => {
    const selected = state.achievementSelected.has(row.id);
    return `<label class="achievementItem${selected ? " selected" : ""}">
      <input type="checkbox" data-achievement-id="${encodeURIComponent(row.id)}"${selected ? " checked" : ""}>
      <img class="achievementJacket" src="${escapeHtml(getJacketUrl(row))}" alt="" loading="lazy">
      <span class="achievementSong"><strong>${escapeHtml(row.name)}</strong><span>${row.button}B · ${escapeHtml(row.pattern)} · Lv.${escapeHtml(row.level)} · floor ${escapeHtml(row.floorName)}</span><small class="achievementDiff">score ${formatSigned(row.scoreDiff, 2)} · logPower ${formatSigned(row.logPowerDiff, 2)}</small></span>
      ${renderAchievementSide(row.previousScore, row.previousLogPower, row.previousMaxCombo, row.previousUpdatedAt, "before")}
      <span class="achievementArrow">→</span>
      ${renderAchievementSide(row.currentScore, row.currentLogPower, row.currentMaxCombo, row.currentUpdatedAt, "after")}
    </label>`;
  }).join("");
}

function updateAchievementSelectionControls(visibleRows = getVisibleAchievementRows()) {
  const selectedCount = visibleRows.filter((row) => state.achievementSelected.has(row.id)).length;
  achievementSelectionSummary.textContent = `${selectedCount}개 선택 · 현재 표시 ${visibleRows.length}개`;
  achievementImageButton.disabled = selectedCount === 0;
  achievementSelectVisibleButton.disabled = visibleRows.length === 0;
  achievementClearButton.disabled = selectedCount === 0;
}

function renderAchievementSide(score, logPower, maxCombo, updatedAt, className) {
  const label = className === "after" ? "이후" : "이전";
  return `<span class="achievementSide ${className}"><small>${label} · ${escapeHtml(formatDate(updatedAt))}</small><strong>${formatValue(score, "score")}</strong><span>logPower ${formatValue(logPower, "logPower")}</span>${maxCombo ? "<small>MAX COMBO</small>" : ""}</span>`;
}

function selectVisibleAchievements() {
  for (const row of getVisibleAchievementRows()) state.achievementSelected.add(row.id);
  renderAchievementList();
}

function autoSelectAchievements() {
  const minimumLogPower = Math.max(0, Number(achievementAutoLogPowerInput.value) || 0);
  const recentHours = Math.max(1, Number(achievementAutoHoursInput.value) || 1);
  achievementAutoLogPowerInput.value = String(minimumLogPower);
  achievementAutoHoursInput.value = String(recentHours);
  const cutoff = Date.now() - recentHours * 60 * 60 * 1000;
  const matches = getFilteredAchievementRows().filter((row) => {
    const updatedAt = new Date(row.currentUpdatedAt).getTime();
    return Number.isFinite(updatedAt) && updatedAt >= cutoff && Number(row.logPowerDiff) >= minimumLogPower;
  });
  state.achievementSelected.clear();
  for (const row of matches) state.achievementSelected.add(row.id);
  saveSettings();
  renderAchievementList();
  achievementStatus.textContent = `최근 ${formatProfileNumber(recentHours)}시간 · logPower +${formatProfileNumber(minimumLogPower)} 이상 · ${matches.length}개 자동 선택`;
}

function startAchievementDragSelection(event) {
  if (event.button !== 0) return;
  const item = event.target.closest(".achievementItem");
  if (!item) return;
  event.preventDefault();
  const checkbox = item.querySelector("[data-achievement-id]");
  if (!checkbox) return;
  const id = decodeURIComponent(checkbox.dataset.achievementId || "");
  achievementDragActive = true;
  achievementDragValue = !state.achievementSelected.has(id);
  achievementSuppressClick = true;
  achievementList.classList.add("dragSelecting");
  applyAchievementDragSelection(item);
}

function continueAchievementDragSelection(event) {
  if (!achievementDragActive) return;
  const item = event.target.closest(".achievementItem");
  if (item) applyAchievementDragSelection(item);
}

function applyAchievementDragSelection(item) {
  const checkbox = item.querySelector("[data-achievement-id]");
  if (!checkbox) return;
  const id = decodeURIComponent(checkbox.dataset.achievementId || "");
  if (achievementDragValue) state.achievementSelected.add(id);
  else state.achievementSelected.delete(id);
  checkbox.checked = achievementDragValue;
  item.classList.toggle("selected", achievementDragValue);
  updateAchievementSelectionControls();
}

function finishAchievementDragSelection() {
  if (!achievementDragActive) return;
  achievementDragActive = false;
  achievementList.classList.remove("dragSelecting");
  setTimeout(() => {
    achievementSuppressClick = false;
  }, 0);
}

async function renderSelfCompareView() {
  if (!state.payload || viewSelect.value !== "selfCompare") return;
  const renderToken = ++state.selfCompareRenderToken;
  const nickname = state.payload.nickname || getCurrentNickname();
  try {
    const entries = await loadRecordHistories(nickname);
    if (renderToken !== state.selfCompareRenderToken || viewSelect.value !== "selfCompare") return;
    const targetKeys = new Set(getHistoryTargets().map(recordKey));
    const available = entries.filter((entry) => targetKeys.has(recordKey(entry)));
    if (!available.some((entry) => entry.history?.length)) {
      state.selfCompareRows = [];
      selfCompareStatus.textContent = "먼저 History 탭에서 기록 히스토리를 수집해 주세요.";
      renderTable();
      return;
    }
    updateSelfCompareBounds(available);
    const range = getSelfCompareRange();
    state.selfCompareRows = buildSelfCompareRows(available, range);
    const endLabel = Number.isFinite(range.end) ? formatDate(new Date(range.end).toISOString()) : "현재";
    selfCompareStatus.textContent = `${formatDate(new Date(range.start).toISOString())} → ${endLabel} · 공통 기록 ${state.selfCompareRows.length}개`;
    renderTable();
  } catch (error) {
    state.selfCompareRows = [];
    selfCompareStatus.textContent = `시점 비교 캐시 오류: ${error.message || error}`;
    renderTable();
  }
}

function updateSelfCompareBounds(entries) {
  const times = entries
    .flatMap((entry) => (entry.history || []).map((event) => new Date(event.ymdt).getTime()))
    .filter(Number.isFinite);
  if (!times.length) return;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const minValue = formatDateTimeInput(min, "floor");
  const maxValue = formatDateTimeInput(max, "ceil");
  selfCompareStart.min = minValue;
  selfCompareStart.max = maxValue;
  selfCompareEnd.min = minValue;
  selfCompareEnd.max = formatDateTimeInput(Date.now(), "ceil");
  if (!selfCompareStart.value) {
    selfCompareStart.value = formatDateTimeInput(min, "ceil");
    saveSettings();
  }
}

function formatDateTimeInput(time, mode = "floor") {
  const minute = 60 * 1000;
  const rounded = mode === "ceil" ? Math.ceil(time / minute) * minute : Math.floor(time / minute) * minute;
  const date = new Date(rounded);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getSelfCompareRange() {
  let start = selfCompareStart.value ? new Date(selfCompareStart.value).getTime() : -Infinity;
  let end = selfCompareEnd.value ? new Date(selfCompareEnd.value).getTime() : Infinity;
  if (start > end) [start, end] = [end, start];
  return { start, end };
}

function latestHistoryEventAt(entry, time) {
  return (entry.history || [])
    .filter((event) => new Date(event.ymdt).getTime() <= time)
    .at(-1) || null;
}

function buildSelfCompareRows(entries, range) {
  const currentByKey = new Map((state.payload?.records || []).map((record) => [recordKey(record), record]));
  return entries.flatMap((entry) => {
    const previous = latestHistoryEventAt(entry, range.start);
    const currentRecord = currentByKey.get(recordKey(entry));
    const current = Number.isFinite(range.end)
      ? latestHistoryEventAt(entry, range.end)
      : currentRecord ? {
        score: Number(currentRecord.score),
        maxCombo: currentRecord.maxCombo === true,
        ymdt: currentRecord.updatedAt,
      } : latestHistoryEventAt(entry, Infinity);
    if (!previous || !current || !Number.isFinite(Number(current.score))) return [];
    const source = currentRecord || entry;
    const floorName = getFloorLabel(source) || getFloorLabel(entry);
    const difficultyConstant = difficultyConstantForFloor(floorName, entry.button);
    const previousLogPower = scoreToPoint(Number(previous.score)) * difficultyConstant;
    const currentLogPower = scoreToPoint(Number(current.score)) * difficultyConstant;
    if (!Number.isFinite(previousLogPower) || !Number.isFinite(currentLogPower)) return [];
    return [{
      button: Number(entry.button),
      title: entry.title,
      name: source.name || entry.name || "",
      pattern: source.pattern || entry.pattern || "",
      level: source.level ?? entry.level ?? "",
      floorName,
      previousScore: Number(previous.score),
      currentScore: Number(current.score),
      scoreDiff: Number(current.score) - Number(previous.score),
      previousLogPower,
      currentLogPower,
      logPowerDiff: currentLogPower - previousLogPower,
      previousMaxCombo: previous.maxCombo === true,
      currentMaxCombo: current.maxCombo === true,
      previousUpdatedAt: previous.ymdt,
      currentUpdatedAt: current.ymdt,
    }];
  });
}

function getHistoryTimeRange() {
  let start = historyStartDate.value ? new Date(`${historyStartDate.value}T00:00:00`).getTime() : -Infinity;
  let end = historyEndDate.value ? new Date(`${historyEndDate.value}T23:59:59.999`).getTime() : Infinity;
  if (start > end) [start, end] = [end, start];
  return { start, end };
}

function formatDateInput(time) {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function updateHistoryRangeBounds(entries) {
  const times = entries.flatMap((entry) => (entry.history || []).map((event) => new Date(event.ymdt).getTime())).filter(Number.isFinite);
  if (!times.length) {
    historyStartDate.removeAttribute("min");
    historyStartDate.removeAttribute("max");
    historyEndDate.removeAttribute("min");
    historyEndDate.removeAttribute("max");
    return;
  }
  const min = formatDateInput(Math.min(...times));
  const max = formatDateInput(Math.max(...times));
  historyStartDate.min = min;
  historyStartDate.max = max;
  historyEndDate.min = min;
  historyEndDate.max = max;
}

function buildHistoryRows(entries, range = getHistoryTimeRange()) {
  return entries.flatMap((entry) => {
    const difficultyConstant = difficultyConstantForFloor(entry.floorName, entry.button);
    return (entry.history || []).filter((event) => {
      const time = new Date(event.ymdt).getTime();
      return time >= range.start && time <= range.end;
    }).map((event) => ({
      button: entry.button,
      title: entry.title,
      name: entry.name,
      pattern: entry.pattern,
      level: entry.level,
      floor: entry.floor,
      floorName: entry.floorName,
      score: event.score,
      maxCombo: event.maxCombo === true,
      logPower: scoreToPoint(Number(event.score)) * difficultyConstant,
      updatedAt: event.ymdt,
    }));
  });
}

function buildLogPowerHistorySeries(entries) {
  const selectedButton = buttonFilter.value;
  const selectedPattern = patternFilter.value;
  const buttons = selectedButton ? [Number(selectedButton)] : BUTTONS;
  const series = new Map(buttons.map((button) => [button, []]));
  const valuesByButton = new Map(buttons.map((button) => [button, new Map()]));
  const events = [];

  for (const entry of entries) {
    const button = Number(entry.button);
    if (!series.has(button) || (selectedPattern && entry.pattern !== selectedPattern)) continue;
    const difficultyConstant = difficultyConstantForFloor(entry.floorName, button);
    if (!Number.isFinite(difficultyConstant)) continue;
    for (const event of entry.history || []) {
      const time = new Date(event.ymdt).getTime();
      const value = scoreToPoint(Number(event.score)) * difficultyConstant;
      if (Number.isFinite(time) && Number.isFinite(value)) {
        events.push({ button, key: entry.id, time, value });
      }
    }
  }
  events.sort((a, b) => a.time - b.time);

  for (const event of events) {
    const values = valuesByButton.get(event.button);
    values.set(event.key, event.value);
    const sum = [...values.values()]
      .sort((a, b) => b - a)
      .slice(0, 50)
      .reduce((total, value) => total + value, 0);
    const points = series.get(event.button);
    const previous = points[points.length - 1];
    if (!previous || Math.abs(previous.value - sum) > 0.0001) points.push({ time: event.time, value: sum });
  }
  return constrainHistorySeries(series, getHistoryTimeRange());
}

function constrainHistorySeries(series, range) {
  if (range.start === -Infinity && range.end === Infinity) return series;
  const constrained = new Map();
  for (const [button, points] of series) {
    const visible = points.filter((point) => point.time >= range.start && point.time <= range.end);
    if (range.start !== -Infinity) {
      const baseline = points.filter((point) => point.time <= range.start).at(-1);
      if (baseline && !visible.some((point) => point.time === range.start)) visible.unshift({ time: range.start, value: baseline.value });
    }
    constrained.set(button, visible);
  }
  return constrained;
}

function renderLogPowerHistoryChart(entries) {
  hideHistoryTooltip();
  const series = buildLogPowerHistorySeries(entries);
  const allPoints = [...series.values()].flat();
  const colors = { 4: "#1268b3", 5: "#23845f", 6: "#7b61c9", 8: "#c03535" };
  const width = 1200;
  const height = 360;
  const pad = { left: 72, right: 24, top: 24, bottom: 48 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  if (!allPoints.length) {
    historyImageButton.disabled = true;
    historyLogPowerChart.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="logPower history"><rect class="chartBg" width="${width}" height="${height}"></rect><text class="emptyText" x="${width / 2}" y="${height / 2}">수집된 히스토리가 없습니다.</text></svg>`;
    historyLegend.innerHTML = "";
    return;
  }
  historyImageButton.disabled = false;

  const minTime = Math.min(...allPoints.map((point) => point.time));
  const rawMaxTime = Math.max(...allPoints.map((point) => point.time));
  const maxTime = rawMaxTime === minTime ? minTime + 86400000 : rawMaxTime;
  const { min: yMin, max: yMax } = getHistoryYAxisRange(allPoints.map((point) => point.value));
  const xFor = (time) => pad.left + ((time - minTime) / (maxTime - minTime)) * plotW;
  const yFor = (value) => pad.top + plotH - ((value - yMin) / (yMax - yMin)) * plotH;

  const yGrid = Array.from({ length: 6 }, (_, index) => {
    const value = yMin + ((yMax - yMin) * index) / 5;
    const y = yFor(value);
    return `<line class="gridLine" x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}"></line><text class="axisLabel" x="${pad.left - 10}" y="${y + 4}" text-anchor="end">${Math.round(value)}</text>`;
  }).join("");
  const xGrid = Array.from({ length: 6 }, (_, index) => {
    const time = minTime + ((maxTime - minTime) * index) / 5;
    const x = xFor(time);
    const date = new Date(time);
    const label = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
    return `<line class="gridLine" x1="${x}" y1="${pad.top}" x2="${x}" y2="${pad.top + plotH}"></line><text class="axisLabel" x="${x}" y="${height - 20}" text-anchor="middle">${label}</text>`;
  }).join("");
  const lines = [...series.entries()].map(([button, points]) => {
    if (!points.length) return "";
    const coordinates = points.map((point) => `${xFor(point.time).toFixed(2)},${yFor(point.value).toFixed(2)}`).join(" ");
    return `<polyline class="historyLine" points="${coordinates}" fill="none" stroke="${colors[button]}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"></polyline>`;
  }).join("");
  const lineHits = [...series.entries()].map(([button, points]) => points.slice(1).map((point, index) => {
    const previous = points[index];
    const info = encodeURIComponent(JSON.stringify({ button, from: previous, to: point }));
    return `<line class="historyLineHit" x1="${xFor(previous.time).toFixed(2)}" y1="${yFor(previous.value).toFixed(2)}" x2="${xFor(point.time).toFixed(2)}" y2="${yFor(point.value).toFixed(2)}" data-info="${info}" tabindex="0"></line>`;
  }).join("")).join("");
  const pointDots = [...series.entries()].map(([button, points]) => points.map((point) => {
    const info = encodeURIComponent(JSON.stringify({ button, time: point.time, value: point.value }));
    return `<circle class="historyPoint" cx="${xFor(point.time).toFixed(2)}" cy="${yFor(point.value).toFixed(2)}" r="4" fill="${colors[button]}" tabindex="0" data-button="${button}" data-info="${info}"></circle>`;
  }).join("")).join("");

  historyLogPowerChart.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Top50 logPower history"><defs><clipPath id="historyPlotClip"><rect x="${pad.left}" y="${pad.top}" width="${plotW}" height="${plotH}"></rect></clipPath></defs><rect class="chartBg" width="${width}" height="${height}"></rect>${yGrid}${xGrid}<g clip-path="url(#historyPlotClip)">${lines}${lineHits}${pointDots}</g><text class="axisTitle" x="16" y="18">Top50 logPower</text></svg>`;
  historyLegend.innerHTML = [...series.entries()]
    .filter(([, points]) => points.length)
    .map(([button, points]) => `<span><i style="background:${colors[button]}"></i>${button}B ${points[points.length - 1].value.toFixed(2)}</span>`)
    .join("");
  bindHistoryTooltips();
}

function getHistoryYAxisRange(values) {
  const finiteValues = values.filter(Number.isFinite);
  if (!finiteValues.length) return { min: 0, max: 100 };
  const dataMin = Math.min(...finiteValues);
  const dataMax = Math.max(...finiteValues);
  const dataSpan = dataMax - dataMin;
  const padding = dataSpan > 0 ? dataSpan * 0.08 : Math.max(Math.abs(dataMax) * 0.02, 10);
  const roughStep = Math.max((dataSpan + padding * 2) / 5, Number.EPSILON);
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const stepFactor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = stepFactor * magnitude;
  const min = Math.max(0, Math.floor((dataMin - padding) / step) * step);
  const max = Math.max(min + step, Math.ceil((dataMax + padding) / step) * step);
  return { min, max };
}

function bindHistoryTooltips() {
  historyLogPowerChart.querySelectorAll(".historyPoint").forEach((point) => {
    point.addEventListener("pointermove", (event) => showHistoryTooltip(event, point.dataset.info));
    point.addEventListener("pointerenter", (event) => showHistoryTooltip(event, point.dataset.info));
    point.addEventListener("focus", (event) => showHistoryTooltip(event, point.dataset.info));
    point.addEventListener("click", (event) => showHistoryTooltip(event, point.dataset.info));
    point.addEventListener("pointerleave", hideHistoryTooltip);
    point.addEventListener("blur", hideHistoryTooltip);
  });
  historyLogPowerChart.querySelectorAll(".historyLineHit").forEach((line) => {
    line.addEventListener("pointermove", (event) => showHistoryLineTooltip(event, line));
    line.addEventListener("pointerenter", (event) => showHistoryLineTooltip(event, line));
    line.addEventListener("focus", (event) => showHistoryLineTooltip(event, line));
    line.addEventListener("pointerleave", hideHistoryTooltip);
    line.addEventListener("blur", hideHistoryTooltip);
  });
}

function showHistoryLineTooltip(event, line) {
  const info = JSON.parse(decodeURIComponent(line.dataset.info || ""));
  let ratio = 0.5;
  const svg = line.ownerSVGElement;
  const matrix = svg?.getScreenCTM();
  if (matrix && event.type !== "focus") {
    const pointer = svg.createSVGPoint();
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    const local = pointer.matrixTransform(matrix.inverse());
    const x1 = Number(line.getAttribute("x1"));
    const y1 = Number(line.getAttribute("y1"));
    const x2 = Number(line.getAttribute("x2"));
    const y2 = Number(line.getAttribute("y2"));
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared > 0) ratio = Math.max(0, Math.min(1, ((local.x - x1) * dx + (local.y - y1) * dy) / lengthSquared));
  }
  const time = info.from.time + (info.to.time - info.from.time) * ratio;
  const value = info.from.value + (info.to.value - info.from.value) * ratio;
  showHistoryTooltip(event, encodeURIComponent(JSON.stringify({ button: info.button, time, value })));
}

function showHistoryTooltip(event, encodedInfo) {
  if (!encodedInfo) return;
  const info = JSON.parse(decodeURIComponent(encodedInfo));
  historyTooltip.innerHTML = `
    <strong>${escapeHtml(info.button)}B Top50 logPower</strong>
    <span>${escapeHtml(Number(info.value).toFixed(2))}</span>
    <span>${escapeHtml(formatDate(new Date(info.time).toISOString()))}</span>`;
  historyTooltip.hidden = false;
  const x = (event.clientX || window.innerWidth / 2) + 14;
  const y = (event.clientY || window.innerHeight / 2) + 14;
  historyTooltip.style.left = `${Math.max(12, Math.min(x, window.innerWidth - historyTooltip.offsetWidth - 12))}px`;
  historyTooltip.style.top = `${Math.max(12, Math.min(y, window.innerHeight - historyTooltip.offsetHeight - 12))}px`;
}

function hideHistoryTooltip() {
  historyTooltip.hidden = true;
}

async function exportHistoryImage() {
  const svg = historyLogPowerChart.querySelector("svg");
  if (!svg || !state.payload || historyImageButton.disabled) return;
  historyImageButton.disabled = true;
  setBusy(true, "히스토리 이미지 생성 중");
  try {
    hideHistoryTooltip();
    const canvas = await drawHistoryImage(svg);
    const nickname = state.payload.nickname || getCurrentNickname() || "user";
    const safeNickname = nickname.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-");
    const copied = await saveCanvasImage(canvas, `v-archive-${safeNickname}-logpower-history.png`);
    statusText.textContent = `히스토리 이미지를 다운로드했습니다.${copied ? " 클립보드에도 복사했습니다." : ""}`;
  } catch (error) {
    statusText.textContent = `히스토리 이미지 생성 오류: ${error.message || error}`;
  } finally {
    setBusy(false);
    historyImageButton.disabled = false;
  }
}

async function drawHistoryImage(svg) {
  const sourceImage = await loadChartSvgImage(svg);
  const margin = 40;
  const width = 1440;
  const chartWidth = width - margin * 2;
  const viewBox = svg.viewBox.baseVal;
  const sourceWidth = viewBox?.width || 1200;
  const sourceHeight = viewBox?.height || 360;
  const chartHeight = Math.round(chartWidth * sourceHeight / sourceWidth);
  const headerHeight = 112;
  const footerHeight = 78;
  const height = margin + headerHeight + chartHeight + footerHeight + margin;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const nickname = state.payload.nickname || getCurrentNickname();
  const buttonLabel = buttonFilter.value ? `${buttonFilter.value}B` : "전체 버튼";
  const patternLabel = patternFilter.value || "전체 패턴";
  const series = buildLogPowerHistorySeries(state.historyEntries);
  const times = [...series.values()].flat().map((point) => point.time).filter(Number.isFinite);
  const rangeLabel = times.length
    ? `${formatDate(new Date(Math.min(...times)).toISOString())} - ${formatDate(new Date(Math.max(...times)).toISOString())}`
    : "기간 없음";

  ctx.fillStyle = "#f4f6f8";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#171a1f";
  ctx.font = "700 30px Segoe UI, Malgun Gothic, Arial";
  ctx.fillText(`${nickname} · Top50 logPower History`, margin, margin + 34);
  ctx.fillStyle = "#687282";
  ctx.font = "16px Segoe UI, Malgun Gothic, Arial";
  ctx.fillText(`${buttonLabel} · ${patternLabel} · ${rangeLabel}`, margin, margin + 66);
  ctx.textAlign = "right";
  ctx.fillText(`v${document.querySelector('meta[name="v-archive-version"]')?.content || "local"} · ${formatDate(new Date().toISOString())}`, width - margin, margin + 66);
  ctx.textAlign = "left";
  ctx.drawImage(sourceImage, margin, margin + headerHeight, chartWidth, chartHeight);

  const colors = { 4: "#1268b3", 5: "#23845f", 6: "#7b61c9", 8: "#c03535" };
  let legendX = margin;
  const legendY = margin + headerHeight + chartHeight + 42;
  ctx.font = "16px Segoe UI, Malgun Gothic, Arial";
  for (const [button, points] of series) {
    if (!points.length) continue;
    const label = `${button}B ${points[points.length - 1].value.toFixed(2)}`;
    ctx.strokeStyle = colors[button];
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY - 6);
    ctx.lineTo(legendX + 24, legendY - 6);
    ctx.stroke();
    ctx.fillStyle = "#687282";
    ctx.fillText(label, legendX + 32, legendY);
    legendX += 62 + ctx.measureText(label).width;
  }
  return canvas;
}

function updateCompareControls() {
  compareOnlyEls.forEach((el) => {
    el.hidden = viewSelect.value !== "compare";
  });
  recordsOnlyEls.forEach((el) => {
    el.hidden = viewSelect.value !== "records";
  });
}

function renderSummary() {
  const summary = state.payload.summary || {};
  const sync = state.payload.sync || {};
  const metrics = [
    ["Records", summary.records ?? 0],
    ["Updated", sync.updatedRecords ?? 0],
    ["Since", sync.since || "full"],
    ["Errors", summary.errors ?? 0],
    ["4B", summary.byButton?.["4"]?.records ?? 0],
    ["5B", summary.byButton?.["5"]?.records ?? 0],
    ["6B", summary.byButton?.["6"]?.records ?? 0],
    ["8B", summary.byButton?.["8"]?.records ?? 0],
    ...BUTTONS.map((button) => [`${button}B LogPower Top50`, calculateTop50LogPowerSum(state.payload.records || [], button).toFixed(2)]),
  ];
  summaryEl.innerHTML = metrics
    .map(([label, value]) => `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(formatValue(value))}</strong></div>`)
    .join("");
}

function renderOverview() {
  renderSummary();
  renderOverviewTable(overviewTierTable, "tiers", state.payload.tiers || []);
  renderOverviewTable(overviewDjClassTable, "djClasses", state.payload.djClasses || []);
}

function renderOverviewTable(table, view, sourceRows) {
  const button = buttonFilter.value;
  const query = searchInput.value.trim().toLowerCase();
  const rows = sourceRows
    .filter((row) => !button || String(row.button) === button)
    .filter((row) => !query || JSON.stringify(row).toLowerCase().includes(query))
    .sort((a, b) => compare(a.button, b.button));
  const colDefs = columns[view] || [];
  if (!rows.length) {
    table.innerHTML = `<tbody><tr><td class="empty">표시할 데이터가 없습니다.</td></tr></tbody>`;
    return;
  }
  const header = `<thead><tr>${colDefs.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join("")}</tr></thead>`;
  const body = `<tbody>${rows.map((row) => `<tr>${colDefs.map(([key]) => renderCell(row, key)).join("")}</tr>`).join("")}</tbody>`;
  table.innerHTML = header + body;
}

function renderChart() {
  if (!state.payload || viewSelect.value !== "chart") return;

  const width = Math.max(760, chartEl.clientWidth || 1000);
  const height = 430;
  const pad = { left: 58, right: 24, top: 22, bottom: 62 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const button = buttonFilter.value;
  const metric = getChartMetric();
  const buttonRecords = filterRows(state.payload.records || []);
  const xRange = configureChartXAxis(metric, buttonRecords);
  if (!xRange) {
    chartEl.innerHTML = `<div class="empty">축 범위를 확인해주세요.</div>`;
    return;
  }

  const groupName = metric.xMode === "maxDjpower" ? "maxDJPower 그룹" : "floor";
  chartTitle.textContent = metric.title;
  chartDescription.textContent = `점은 개별 기록, 선은 ${groupName}별 최고/평균/최저${metric.floorMaxValue ? "/최대치" : ""} ${metric.label}입니다.`;
  chartFloorMaxLegend.hidden = !metric.floorMaxValue;
  chartBelowLegend.hidden = metric.xMode === "maxDjpower";
  const highlightsTop50 = metric.key === "logPower" || metric.key === "point";
  chartTop50Legend.hidden = !highlightsTop50;
  chartMaxLegend.textContent = `${groupName} 최고`;
  chartAvgLegend.textContent = `${groupName} 평균`;
  chartMinLegend.textContent = `${groupName} 최저`;
  chartFloorMaxLegendText.textContent = metric.key === "logPower" && !button
    ? "버튼별 floor 최대치"
    : metric.xMode === "maxDjpower" ? "maxDJPower" : "floor 최대치";
  const scopedRecords = buttonRecords
    .map((row) => {
      const floorLabel = getFloorLabel(row);
      const xLabel = metric.xMode === "maxDjpower" ? djpowerGroupKey(row.maxDjpower) : floorLabel;
      return {
        ...row,
        floorLabel,
        xLabel,
        metricValue: metric.value(row, floorLabel, button || String(row.button)),
        floorMaxValue: metric.floorMaxValue ? metric.floorMaxValue(row, floorLabel, button || String(row.button)) : NaN,
      };
    })
    .filter((row) => xRange.labels.includes(row.xLabel) && Number.isFinite(row.metricValue));
  const top50Keys = highlightsTop50
    ? buildTop50RecordKeys(buttonRecords, (row) => {
      const floorLabel = getFloorLabel(row);
      return metric.value(row, floorLabel, String(row.button));
    })
    : new Set();
  const floorMaxSeries = buildFloorMaxSeries(xRange.labels, scopedRecords, metric, button);
  const yRange = getMetricRange(scopedRecords, metric);
  if (yRange && yMinAutoInput.checked) yMinInput.value = formatAxisValue(yRange.min);
  yMaxInput.value = yRange ? formatAxisValue(yRange.max) : "";
  storeCurrentChartRange();

  if (!yRange) {
    chartEl.innerHTML = `<div class="empty">표시할 기록이 없습니다.</div>`;
    return;
  }

  const records = scopedRecords.filter((row) => row.metricValue >= yRange.min && row.metricValue <= yRange.max);

  const xFor = (label, jitter = 0) => {
    const index = xRange.labels.indexOf(label);
    if (xRange.labels.length === 1) return pad.left + plotW / 2 + jitter * Math.min(48, plotW * 0.1);
    const denominator = Math.max(1, xRange.labels.length - 1);
    return pad.left + ((index + jitter) / denominator) * plotW;
  };
  const yFor = (value) => pad.top + (1 - (value - yRange.min) / (yRange.max - yRange.min)) * plotH;

  const grouped = groupMetricsByFloor(records);
  const minByFloor = buildMinByFloor(scopedRecords);
  const averagePoints = buildSeriesPoints(xRange.labels, grouped, xFor, yFor, "avg");
  const maxPoints = buildSeriesPoints(xRange.labels, grouped, xFor, yFor, "max");
  const minPoints = buildSeriesPoints(xRange.labels, grouped, xFor, yFor, "min");
  const floorMaxLines = [...floorMaxSeries.entries()].map(([seriesButton, values]) => {
    const points = buildFloorMaxSeriesPoints(xRange.labels, values, xFor, yFor);
    if (!points) return "";
    const buttonClass = seriesButton ? ` floorMaxButton${seriesButton}` : "";
    const label = seriesButton ? `${seriesButton}B floor 최대치` : metric.xMode === "maxDjpower" ? "maxDJPower" : "floor 최대치";
    return `<polyline class="floorMaxLine${buttonClass}" points="${points}"><title>${escapeHtml(label)}</title></polyline>`;
  }).join("");
  const grid = buildGrid(xRange, yRange, pad, plotW, plotH, xFor, yFor);
  const dots = records.map((row) => {
    const jitter = stableJitter(`${row.name}-${row.pattern}-${row.level}`) * 0.42;
    const cx = clampChartDotX(xFor(row.xLabel, jitter), pad.left, plotW).toFixed(2);
    const cy = yFor(row.metricValue).toFixed(2);
    const isBelowNextFloorMin = metric.xMode !== "maxDjpower" && belowNextFloorMin(row, minByFloor);
    const isTop50 = top50Keys.has(recordKey(row));
    const className = [
      "chartDot",
      isTop50 ? "top50Dot" : "",
      row.maxCombo === true ? "comboDot" : "",
      isBelowNextFloorMin ? "belowNextDot" : "",
    ].filter(Boolean).join(" ");
    const info = encodeURIComponent(JSON.stringify({
      name: row.name || "",
      pattern: row.pattern || "",
      level: row.level ?? "",
      floor: row.floorLabel,
      metricKey: metric.key,
      metricLabel: metric.label,
      metricValue: row.metricValue,
      score: Number(row.score),
      logPower: scoreToPoint(Number(row.score)) * difficultyConstantForFloor(row.floorLabel, row.button),
      rating: row.rating ?? "",
      djpower: row.djpower ?? "",
      maxDjpower: row.maxDjpower ?? "",
      maxCombo: row.maxCombo === true,
      top50: isTop50,
      belowNextFloorMin: isBelowNextFloorMin,
      updatedAt: row.updatedAt || "",
    }));
    return `<circle class="${className}" cx="${cx}" cy="${cy}" r="${row.maxCombo === true ? 4.8 : 3.9}" data-info="${info}" tabindex="0"></circle>`;
  }).join("");

  chartEl.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(metric.title)} scatter chart">
      <defs><clipPath id="chartPlotClip"><rect x="${pad.left}" y="${pad.top}" width="${plotW}" height="${plotH}"></rect></clipPath></defs>
      <rect class="chartBg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${grid}
      <g clip-path="url(#chartPlotClip)">
        ${floorMaxLines}
        ${maxPoints ? `<polyline class="maxLine" points="${maxPoints}"></polyline>` : ""}
        ${averagePoints ? `<polyline class="avgLine" points="${averagePoints}"></polyline>` : ""}
        ${minPoints ? `<polyline class="minLine" points="${minPoints}"></polyline>` : ""}
        ${dots}
      </g>
      <text class="axisTitle" x="16" y="18">${escapeHtml(metric.label)}</text>
      <text class="axisTitle" x="${width - 170}" y="${height - 16}">${escapeHtml(xRange.axisTitle)}</text>
      ${records.length ? "" : `<text class="emptyText" x="${width / 2}" y="${height / 2}">표시할 기록이 없습니다.</text>`}
    </svg>`;
  bindChartTooltips();
}

function bindChartTooltips() {
  chartEl.querySelectorAll(".chartDot").forEach((dot) => {
    dot.addEventListener("mousemove", (event) => showTooltip(event, dot.dataset.info));
    dot.addEventListener("mouseenter", (event) => showTooltip(event, dot.dataset.info));
    dot.addEventListener("focus", (event) => showTooltip(event, dot.dataset.info));
    dot.addEventListener("mouseleave", hideTooltip);
    dot.addEventListener("blur", hideTooltip);
  });
}

function showTooltip(event, encodedInfo) {
  if (!encodedInfo) return;
  const info = JSON.parse(decodeURIComponent(encodedInfo));
  chartTooltip.innerHTML = `
    <strong>${escapeHtml(info.name)}</strong>
    <span>${escapeHtml(info.pattern)} · Lv.${escapeHtml(info.level)} · floor ${escapeHtml(info.floor)}</span>
    <span>${escapeHtml(info.metricLabel)} ${escapeHtml(formatChartMetric(info.metricValue, info.metricKey))}${info.top50 ? " · TOP50" : ""}${info.maxCombo ? " · MAX COMBO" : ""}${info.belowNextFloorMin ? " · 상위 floor 최저 미만" : ""}</span>
    <span>score ${escapeHtml(formatChartMetric(info.score, "score"))} · logPower ${escapeHtml(formatChartMetric(info.logPower, "logPower"))}</span>
    <span>point ${escapeHtml(formatValue(info.rating, "rating"))} · djpower ${escapeHtml(formatValue(info.djpower, "djpower"))} · maxDJPower ${escapeHtml(formatValue(info.maxDjpower, "djpower"))}</span>
    <span>${escapeHtml(formatDate(info.updatedAt))}</span>`;
  chartTooltip.hidden = false;
  const x = event.clientX + 14;
  const y = event.clientY + 14;
  chartTooltip.style.left = `${Math.min(x, window.innerWidth - chartTooltip.offsetWidth - 12)}px`;
  chartTooltip.style.top = `${Math.min(y, window.innerHeight - chartTooltip.offsetHeight - 12)}px`;
}

function hideTooltip() {
  chartTooltip.hidden = true;
}

async function exportChartImage() {
  const svg = chartEl.querySelector("svg");
  if (!svg || !state.payload) return;
  chartImageButton.disabled = true;
  setBusy(true, "산포도 이미지 생성 중");
  try {
    const canvas = await drawChartImage(svg);
    const nickname = state.payload.nickname || getCurrentNickname() || "user";
    const metric = chartMetricSelect.value;
    const safeNickname = nickname.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-");
    const buttonName = buttonFilter.value ? `${buttonFilter.value}B` : "all-buttons";
    const copied = await saveCanvasImage(canvas, `v-archive-${safeNickname}-${buttonName}-${metric}.png`);
    statusText.textContent = `산포도 이미지를 다운로드했습니다.${copied ? " 클립보드에도 복사했습니다." : ""}`;
  } catch (error) {
    statusText.textContent = `산포도 이미지 생성 오류: ${error.message}`;
  } finally {
    setBusy(false);
    chartImageButton.disabled = false;
  }
}

async function drawChartImage(svg) {
  const sourceImage = await loadChartSvgImage(svg);
  const margin = 40;
  const width = 1440;
  const chartWidth = width - margin * 2;
  const viewBox = svg.viewBox.baseVal;
  const sourceWidth = viewBox?.width || 1000;
  const sourceHeight = viewBox?.height || 430;
  const chartHeight = Math.round(chartWidth * sourceHeight / sourceWidth);
  const headerHeight = 116;
  const footerHeight = 92;
  const height = margin + headerHeight + chartHeight + footerHeight + margin;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const metric = getChartMetric();
  const nickname = state.payload.nickname || getCurrentNickname();

  ctx.fillStyle = "#f4f6f8";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#171a1f";
  ctx.font = "700 30px Segoe UI, Malgun Gothic, Arial";
  const buttonName = buttonFilter.value ? `${buttonFilter.value}B` : "전체 버튼";
  ctx.fillText(`${nickname} · ${metric.title} · ${buttonName}`, margin, margin + 34);
  ctx.fillStyle = "#687282";
  ctx.font = "16px Segoe UI, Malgun Gothic, Arial";
  const yMinMode = yMinAutoInput.checked ? "자동" : "수동";
  const yMaxMode = metric.fixedMax ? "고정" : yMaxAutoInput.checked ? "자동" : "수동";
  const xName = metric.xMode === "maxDjpower" ? "DJ group" : "floor";
  const xStart = xMinSelect.selectedOptions[0]?.textContent || xMinSelect.value;
  const xEnd = xMaxSelect.selectedOptions[0]?.textContent || xMaxSelect.value;
  ctx.fillText(`${xName} ${xStart} - ${xEnd}  |  Y ${yMinInput.value} - ${yMaxInput.value}  |  최소 ${yMinMode} · 최대 ${yMaxMode}`, margin, margin + 66);
  const version = document.querySelector('meta[name="v-archive-version"]')?.content || "local";
  ctx.textAlign = "right";
  ctx.fillText(`v${version} · ${formatDate(new Date().toISOString())}`, width - margin, margin + 66);
  ctx.textAlign = "left";

  ctx.drawImage(sourceImage, margin, margin + headerHeight, chartWidth, chartHeight);
  drawChartImageLegend(ctx, margin, margin + headerHeight + chartHeight + 38, metric);
  return canvas;
}

function loadChartSvgImage(svg) {
  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = `
    .chartBg{fill:#fff;stroke:#d9dee7}.gridLine{stroke:#e3e7ee;stroke-width:1}.axisLine{stroke:#9aa4b2;stroke-width:1.2}
    .tickLabel,.axisLabel{fill:#687282;font:12px Segoe UI,Malgun Gothic,Arial}.axisTitle{fill:#394150;font:13px Segoe UI,Malgun Gothic,Arial}
    .avgLine,.maxLine,.minLine,.floorMaxLine{fill:none;stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round}
    .avgLine{stroke:#c03535}.maxLine{stroke:#23845f}.minLine{stroke:#7b61c9}.floorMaxLine{stroke:#1268b3;stroke-dasharray:7 5}
    .floorMaxButton4{stroke:#1268b3}.floorMaxButton5{stroke:#23845f}.floorMaxButton6{stroke:#7b61c9}.floorMaxButton8{stroke:#c07b24}
    .chartDot{fill:rgba(18,104,179,.58);stroke:rgba(18,104,179,.88);stroke-width:1}.top50Dot{fill:#f0a83a;stroke:#8a5300}
    .comboDot{fill:#4eeeaf;stroke:#159b72}.belowNextDot{fill:#e03b3b;stroke:#9f1f1f}
    .top50Dot.comboDot{fill:#4eeeaf;stroke:#d08a18;stroke-width:2.2}.top50Dot.belowNextDot{fill:#e03b3b;stroke:#f0a83a;stroke-width:2.2}.historyPoint{stroke:#fff;stroke-width:2}
    .compareMinePoint{fill:rgba(23,63,103,.72);stroke:#0b2942}.compareOtherPoint{fill:rgba(192,53,53,.58);stroke:#8f2929}
    .compareTiePoint{fill:rgba(104,114,130,.58);stroke:#4d5664}.compareEqual{stroke:#687282;stroke-width:1.6;stroke-dasharray:7 5}
    .compareFloorTrend{fill:none;stroke:#b36c00;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
    .compareFloorMidpoint{fill:#fff;stroke:#b36c00;stroke-width:2}
    .compareVectorBoundary{fill:rgba(18,104,179,.025);stroke:#9aa4b2;stroke-width:1.4}.compareVectorMineAxis{stroke:#23845f;stroke-width:2.4}
    .compareVectorOtherAxis{stroke:#c03535;stroke-width:2.4}.compareVectorLabel{fill:#687282;font:12px Segoe UI,Malgun Gothic,Arial}
    .emptyText{fill:#687282;font:14px Segoe UI,Malgun Gothic,Arial;text-anchor:middle}`;
  clone.insertBefore(style, clone.firstChild);
  const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("그래프를 이미지로 변환할 수 없습니다."));
    };
    image.src = url;
  });
}

function drawChartImageLegend(ctx, x, y, metric) {
  const groupName = metric.xMode === "maxDjpower" ? "그룹" : "floor";
  const entries = [
    ["dot", "#1268b3", "기록"],
  ];
  if (metric.key === "logPower" || metric.key === "point") entries.push(["dot", "#f0a83a", "버튼별 TOP50"]);
  entries.push(["dot", "#4eeeaf", "MAX COMBO"]);
  if (metric.xMode !== "maxDjpower") entries.push(["dot", "#e03b3b", "상위 floor 최저 미만"]);
  entries.push(
    ["line", "#23845f", `${groupName} 최고`], ["line", "#c03535", `${groupName} 평균`], ["line", "#7b61c9", `${groupName} 최저`],
  );
  if (metric.floorMaxValue) {
    if (metric.key === "logPower" && !buttonFilter.value) {
      entries.push(
        ["dash", "#1268b3", "4B floor 최대치"],
        ["dash", "#23845f", "5B floor 최대치"],
        ["dash", "#7b61c9", "6B floor 최대치"],
        ["dash", "#c07b24", "8B floor 최대치"],
      );
    } else {
      entries.push(["dash", "#1268b3", metric.xMode === "maxDjpower" ? "maxDJPower" : "floor 최대치"]);
    }
  }
  ctx.font = "15px Segoe UI, Malgun Gothic, Arial";
  ctx.fillStyle = "#687282";
  for (const [kind, color, label] of entries) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    if (kind === "dot") {
      ctx.beginPath();
      ctx.arc(x + 6, y - 5, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.setLineDash(kind === "dash" ? [7, 5] : []);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x + 24, y - 5);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = "#687282";
    ctx.fillText(label, x + 32, y);
    x += 52 + ctx.measureText(label).width;
  }
}

function configureChartXAxis(metric, records) {
  const mode = metric.xMode || "floor";
  const groups = mode === "maxDjpower"
    ? buildDjpowerGroups(records)
    : floorLabels.map((label) => ({ key: label, label }));
  if (!groups.length) return null;

  const saved = state.chartXRangeByMode[mode] || {};
  const currentMode = xMinSelect.dataset.mode;
  const currentMin = currentMode === mode ? xMinSelect.value : saved.min;
  const currentMax = currentMode === mode ? xMaxSelect.value : saved.max;
  const options = groups.map((group) => `<option value="${escapeHtml(group.key)}">${escapeHtml(group.label)}</option>`).join("");
  xMinSelect.innerHTML = options;
  xMaxSelect.innerHTML = options;
  xMinSelect.dataset.mode = mode;
  xMaxSelect.dataset.mode = mode;
  const groupKeys = groups.map((group) => group.key);
  xMinSelect.value = groupKeys.includes(currentMin) ? currentMin : groups[0].key;
  xMaxSelect.value = groupKeys.includes(currentMax) ? currentMax : groups.at(-1).key;
  state.chartXMode = mode;
  xMinLabel.textContent = mode === "maxDjpower" ? "DJ 그룹 시작" : "Floor 시작";
  xMaxLabel.textContent = mode === "maxDjpower" ? "DJ 그룹 끝" : "Floor 끝";

  const keys = groupKeys;
  let start = keys.indexOf(xMinSelect.value);
  let end = keys.indexOf(xMaxSelect.value);
  if (mode === "maxDjpower" && start > end) {
    [xMinSelect.value, xMaxSelect.value] = [xMaxSelect.value, xMinSelect.value];
    [start, end] = [end, start];
  }
  if (start < 0 || end < 0 || start > end) return null;
  state.chartXRangeByMode[mode] = { min: xMinSelect.value, max: xMaxSelect.value };
  return {
    mode,
    labels: keys.slice(start, end + 1),
    displayLabels: new Map(groups.map((group) => [group.key, group.axisLabel || group.label])),
    axisTitle: mode === "maxDjpower" ? "maxDJPower group" : "floorName (n.m)",
  };
}

function buildDjpowerGroups(records) {
  const groups = new Map();
  for (const row of records) {
    const maxDjpower = Number(row.maxDjpower);
    if (!Number.isFinite(maxDjpower)) continue;
    const key = djpowerGroupKey(maxDjpower);
    if (!groups.has(key)) groups.set(key, { key, maxDjpower, categories: new Map(), rank: Infinity });
    const group = groups.get(key);
    const category = djpowerCategory(row);
    if (category) {
      group.categories.set(category.label, category.rank);
      group.rank = Math.min(group.rank, category.rank);
    }
  }
  return [...groups.values()]
    .sort((a, b) => b.rank - a.rank || a.maxDjpower - b.maxDjpower)
    .map((group) => {
      const labels = [...group.categories.entries()]
        .sort((a, b) => a[1] - b[1] || Number(b[0].startsWith("SC")) - Number(a[0].startsWith("SC")))
        .map(([label]) => label);
      const categoryLabel = djpowerRankLabel(group.rank) || labels.join(" = ") || formatAxisValue(group.maxDjpower);
      return {
        key: group.key,
        label: `${categoryLabel} (${formatAxisValue(group.maxDjpower)})`,
        axisLabel: categoryLabel,
      };
    });
}

function djpowerCategory(row) {
  const level = Number.parseInt(row.level, 10);
  if (!Number.isFinite(level) || level < 1 || level > 15) return null;
  const isSc = String(row.pattern || "").toUpperCase() === "SC";
  if (isSc) return { label: `SC${level}`, rank: 15 - level };
  const rank = level >= 12 ? 37 - level * 2 : 26 - level;
  return { label: `non-SC${level}`, rank };
}

function djpowerRankLabel(rank) {
  if (!Number.isFinite(rank) || rank < 0 || rank > 25) return "";
  if (rank === 7) return "SC8 = non-SC15";
  if (rank === 9) return "SC6 = non-SC14";
  if (rank === 11) return "SC4 = non-SC13";
  if (rank === 13) return "SC2 = non-SC12";
  if (rank <= 14) return `SC${15 - rank}`;
  return `non-SC${26 - rank}`;
}

function djpowerGroupKey(value) {
  const number = Number(value);
  return Number.isFinite(number) ? String(Number(number.toFixed(6))) : "";
}

function getChartMetric() {
  const key = chartMetricSelect.value;
  if (key === "scorePoint") {
    return {
      key,
      label: "scorePoint",
      title: "Floor × scorePoint",
      value: (row) => scoreToPoint(Number(row.score)),
      floorMaxValue: () => 10,
      floorMaxForFloor: () => 10,
      fixedMax: 10,
    };
  }
  if (key === "logPower") {
    return {
      key,
      label: "logPower",
      title: "Floor × logPower",
      value: (row, floorLabel, button) => scoreToPoint(Number(row.score)) * difficultyConstantForFloor(floorLabel, button),
      floorMaxValue: (row, floorLabel, button) => 10 * difficultyConstantForFloor(floorLabel, button),
      floorMaxForFloor: (floorLabel, button) => 10 * difficultyConstantForFloor(floorLabel, button),
    };
  }
  if (key === "point") {
    return {
      key,
      label: "Point",
      title: "Floor × Point",
      value: (row) => row.rating === null || row.rating === undefined || row.rating === "" ? NaN : Number(row.rating),
      floorMaxValue: (row) => row.maxRating === null || row.maxRating === undefined || row.maxRating === "" ? NaN : Number(row.maxRating),
    };
  }
  if (key === "djpower") {
    return {
      key,
      label: "DJPower",
      title: "MaxDJPower × DJPower",
      xMode: "maxDjpower",
      value: (row) => row.djpower === null || row.djpower === undefined || row.djpower === "" ? NaN : Number(row.djpower),
      floorMaxValue: (row) => row.maxDjpower === null || row.maxDjpower === undefined || row.maxDjpower === "" ? NaN : Number(row.maxDjpower),
    };
  }
  return { key: "score", label: "Score", title: "Floor × Score", value: (row) => Number(row.score), fixedMax: 100 };
}

function getMetricRange(records, metric) {
  const values = records.map((row) => row.metricValue).filter(Number.isFinite);
  if (!values.length) return null;
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const dataSpan = Math.max(dataMax - dataMin, Math.abs(dataMax) * 0.01, 0.1);
  const rangePadding = Math.max(dataSpan * 0.02, 0.01);
  const autoMin = metric.fixedMax && dataMin >= metric.fixedMax
    ? metric.fixedMax - 0.5
    : Math.max(0, dataMin - rangePadding);
  const manualMin = Number(yMinInput.value);
  const min = yMinAutoInput.checked || !Number.isFinite(manualMin) ? autoMin : manualMin;
  if (metric.fixedMax) {
    if (min >= metric.fixedMax) return { min: metric.fixedMax - 0.5, max: metric.fixedMax };
    return { min, max: metric.fixedMax };
  }
  const step = niceStep(dataSpan / 5);
  const autoMax = dataMax + rangePadding;
  const manualMax = Number(yMaxInput.value);
  const useAutoMax = yMaxAutoInput.checked || !Number.isFinite(manualMax);
  const requestedMax = useAutoMax ? autoMax : manualMax;
  if (requestedMax > min) return { min, max: requestedMax };
  return useAutoMax ? { min: min - step, max: requestedMax } : { min, max: min + step };
}

function buildFloorMaxByFloor(labels, records, metric, button) {
  const values = new Map();
  if (!metric.floorMaxValue) return values;
  if (metric.floorMaxForFloor && button) {
    for (const label of labels) {
      const value = metric.floorMaxForFloor(label, button);
      if (Number.isFinite(value)) values.set(label, value);
    }
    return values;
  }
  for (const row of records) {
    if (!Number.isFinite(row.floorMaxValue)) continue;
    const current = values.get(row.xLabel);
    if (current === undefined || row.floorMaxValue > current) values.set(row.xLabel, row.floorMaxValue);
  }
  return values;
}

function buildFloorMaxSeries(labels, records, metric, button) {
  const series = new Map();
  if (!metric.floorMaxValue) return series;
  if (metric.key === "logPower" && metric.floorMaxForFloor) {
    const buttons = button ? [Number(button)] : BUTTONS;
    for (const seriesButton of buttons) {
      const values = new Map();
      for (const label of labels) {
        const value = metric.floorMaxForFloor(label, seriesButton);
        if (Number.isFinite(value)) values.set(label, value);
      }
      series.set(String(seriesButton), values);
    }
    return series;
  }
  series.set("", buildFloorMaxByFloor(labels, records, metric, button));
  return series;
}

function buildFloorMaxSeriesPoints(labels, floorMaxByFloor, xFor, yFor) {
  return labels
    .filter((label) => floorMaxByFloor.has(label))
    .map((label) => `${xFor(label).toFixed(2)},${yFor(floorMaxByFloor.get(label)).toFixed(2)}`)
    .join(" ");
}

function formatChartMetric(value, key) {
  if (!Number.isFinite(Number(value))) return "";
  if (key === "score") return Number(value).toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  return Number(value).toFixed(2);
}

function buildTop50RecordKeys(records, valueFor) {
  const byButton = new Map();
  for (const record of records) {
    const value = Number(valueFor(record));
    if (!Number.isFinite(value)) continue;
    const button = String(record.button ?? "");
    if (!byButton.has(button)) byButton.set(button, []);
    byButton.get(button).push({ key: recordKey(record), value });
  }
  const keys = new Set();
  for (const rows of byButton.values()) {
    rows.sort((a, b) => b.value - a.value || a.key.localeCompare(b.key));
    for (const row of rows.slice(0, 50)) keys.add(row.key);
  }
  return keys;
}

function formatAxisValue(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function buildGrid(xRange, yRange, pad, plotW, plotH, xFor, yFor) {
  const labels = xRange.labels;
  const yStep = niceStep((yRange.max - yRange.min) / 5);
  const yStart = Math.ceil(yRange.min / yStep) * yStep;
  const yLines = [];
  for (let y = yStart; y <= yRange.max + 0.0001; y += yStep) {
    const py = yFor(y).toFixed(2);
    yLines.push(`<line class="gridLine" x1="${pad.left}" x2="${pad.left + plotW}" y1="${py}" y2="${py}"></line>`);
    yLines.push(`<text class="tickLabel" x="18" y="${Number(py) + 4}">${formatTick(y)}</text>`);
  }

  const tickLabels = xRange.mode === "maxDjpower"
    ? labels.filter((label, index) => index % Math.max(1, Math.ceil(labels.length / 16)) === 0 || index === labels.length - 1)
    : labels.filter((label) => label.endsWith(".2"));
  const xLines = tickLabels
    .map((label) => {
      const px = xFor(label).toFixed(2);
      const text = xRange.mode === "maxDjpower" ? xRange.displayLabels.get(label) : label.split(".")[0];
      return `<line class="gridLine" x1="${px}" x2="${px}" y1="${pad.top}" y2="${pad.top + plotH}"></line>
        <text class="tickLabel" x="${Number(px) - 8}" y="${pad.top + plotH + 26}" transform="rotate(-40 ${Number(px) - 8} ${pad.top + plotH + 26})">${escapeHtml(text)}</text>`;
    })
    .join("");

  return `
    ${yLines.join("")}
    ${xLines}
    <line class="axisLine" x1="${pad.left}" x2="${pad.left}" y1="${pad.top}" y2="${pad.top + plotH}"></line>
    <line class="axisLine" x1="${pad.left}" x2="${pad.left + plotW}" y1="${pad.top + plotH}" y2="${pad.top + plotH}"></line>`;
}

function niceStep(value) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const scaled = value / power;
  if (scaled <= 1) return power;
  if (scaled <= 2) return 2 * power;
  if (scaled <= 5) return 5 * power;
  return 10 * power;
}

function formatTick(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function groupMetricsByFloor(records) {
  const grouped = new Map();
  for (const row of records) {
    if (!grouped.has(row.xLabel)) grouped.set(row.xLabel, []);
    grouped.get(row.xLabel).push(row.metricValue);
  }
  return grouped;
}

function buildMinByFloor(records) {
  const minByFloor = new Map();
  for (const row of records) {
    if (!row.floorLabel || !Number.isFinite(row.metricValue)) continue;
    const current = minByFloor.get(row.floorLabel);
    if (current === undefined || row.metricValue < current) minByFloor.set(row.floorLabel, row.metricValue);
  }
  return minByFloor;
}

function belowNextFloorMin(row, minByFloor) {
  const index = floorLabels.indexOf(row.floorLabel);
  if (index < 0 || index >= floorLabels.length - 1) return false;
  const nextMin = minByFloor.get(floorLabels[index + 1]);
  return Number.isFinite(nextMin) && row.metricValue < nextMin;
}

function buildSeriesPoints(labels, grouped, xFor, yFor, kind) {
  return labels
    .filter((label) => grouped.has(label))
    .map((label) => {
      const values = grouped.get(label);
      let score;
      if (kind === "max") score = Math.max(...values);
      else if (kind === "min") score = Math.min(...values);
      else score = values.reduce((sum, value) => sum + value, 0) / values.length;
      return `${xFor(label).toFixed(2)},${yFor(score).toFixed(2)}`;
    })
    .join(" ");
}

function getFloorLabel(row) {
  const name = String(row.floorName || "").trim();
  if (/^\d{1,2}\.[1-3]$/.test(name)) return name;
  const floor = String(row.floor || "").replace(/\D/g, "");
  if (floor.length >= 2) return `${Number(floor.slice(0, -1))}.${floor.slice(-1)}`;
  return "";
}

function stableJitter(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return (hash % 1000) / 1000 - 0.5;
}

function clampChartDotX(x, plotLeft, plotWidth) {
  return Math.min(plotLeft + plotWidth - CHART_DOT_EDGE_INSET, Math.max(plotLeft + CHART_DOT_EDGE_INSET, x));
}

function renderTable() {
  const view = viewSelect.value;
  const baseRows = getRowsForView(view);
  const rows = filterRows(baseRows);
  sortRows(rows);
  renderTableSummary(view, ["compare", "floorMinScore", "selfCompare"].includes(view) ? rows : baseRows);
  const limit = Number(limitSelect.value);
  const visibleRows = limit > 0 ? rows.slice(0, limit) : rows;
  const colDefs = columns[view] || [];

  if (!visibleRows.length) {
    tableEl.innerHTML = `<tbody><tr><td class="empty">표시할 데이터가 없습니다.</td></tr></tbody>`;
    return;
  }

  const header = `<thead><tr>${colDefs
    .map(([key, label]) => `<th data-key="${key}">${escapeHtml(label)}${state.sortKey === key ? (state.sortDir === "asc" ? " ▲" : " ▼") : ""}</th>`)
    .join("")}</tr></thead>`;
  const body = `<tbody>${visibleRows
    .map((row) => `<tr>${colDefs.map(([key]) => renderCell(row, key)).join("")}</tr>`)
    .join("")}</tbody>`;
  tableEl.innerHTML = header + body;
  tableEl.querySelectorAll("th").forEach((th) => {
    th.addEventListener("click", () => toggleSort(th.dataset.key));
  });
}

function renderTableSummary(view, rows) {
  if (view === "selfCompare") {
    renderSelfCompareSummary(rows);
    return;
  }
  if (view === "compare") {
    renderCompareSummary(rows);
    return;
  }
  if (view === "floorMinScore") {
    renderFloorMinScoreSummary(rows);
    return;
  }
  if (view !== "top100") {
    tableSummary.hidden = true;
    tableSummary.innerHTML = "";
    return;
  }
  const buttons = buttonFilter.value ? [buttonFilter.value] : ["4", "5", "6", "8"];
  const cards = buttons.map((button) => renderTop100Metric(button, rows));
  tableSummary.innerHTML = cards.join("");
  tableSummary.querySelectorAll("[data-top-image-button]").forEach((button) => {
    button.addEventListener("click", () => generateTopImage(button.dataset.topImageButton));
  });
  tableSummary.hidden = false;
}

function renderSelfCompareSummary(rows) {
  const improved = rows.filter((row) => row.scoreDiff > 0).length;
  const unchanged = rows.filter((row) => Math.abs(row.scoreDiff) < 1e-9).length;
  const averageScoreDiff = rows.length ? rows.reduce((sum, row) => sum + row.scoreDiff, 0) / rows.length : 0;
  const buttons = buttonFilter.value ? [Number(buttonFilter.value)] : BUTTONS;
  const cards = [
    ["공통 기록", rows.length],
    ["score 상승", improved],
    ["score 동일", unchanged],
    ["평균 score 변화", formatSigned(averageScoreDiff, 3)],
    ...buttons.map((button) => {
      const buttonRows = rows.filter((row) => Number(row.button) === button);
      const previous = buttonRows.map((row) => row.previousLogPower).sort((a, b) => b - a).slice(0, 50).reduce((sum, value) => sum + value, 0);
      const current = buttonRows.map((row) => row.currentLogPower).sort((a, b) => b - a).slice(0, 50).reduce((sum, value) => sum + value, 0);
      return [`${button}B 공통 Top50`, `${previous.toFixed(2)} → ${current.toFixed(2)} (${formatSigned(current - previous, 2)})`];
    }),
  ];
  tableSummary.innerHTML = cards
    .map(([label, value]) => `<div class="tableMetric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`)
    .join("");
  tableSummary.hidden = false;
}

function renderFloorMinScoreSummary(rows) {
  state.floorMinImageRows = rows;
  state.floorMinImageRecords = filterRecordsForFloorImage(state.payload?.records || []);
  const settings = loadSettings();
  const availableFloors = getAvailableFloorLabels(state.floorMinImageRecords);
  const fallbackStart = availableFloors[availableFloors.length - 1] || floorLabels[floorLabels.length - 1];
  const fallbackEnd = availableFloors[0] || floorLabels[0];
  const start = availableFloors.includes(settings.floorMinImageStartFloor) ? settings.floorMinImageStartFloor : fallbackStart;
  const end = availableFloors.includes(settings.floorMinImageEndFloor) ? settings.floorMinImageEndFloor : fallbackEnd;
  tableSummary.innerHTML = `
    <div class="tableMetric tableMetricAction wideMetric">
      <span>Floor별 최고/최저 이미지</span>
      <strong>${availableFloors.length} floors</strong>
      <div class="rangeControls">
        <label>시작 ${renderFloorSelect("floorMinImageStart", availableFloors, start)}</label>
        <label>끝 ${renderFloorSelect("floorMinImageEnd", availableFloors, end)}</label>
        <button id="floorMinImageButton" class="smallActionButton" type="button">이미지 다운로드</button>
      </div>
    </div>`;
  const startInput = tableSummary.querySelector("#floorMinImageStart");
  const endInput = tableSummary.querySelector("#floorMinImageEnd");
  const saveRange = () => {
    const next = loadSettings();
    next.floorMinImageStartFloor = startInput.value;
    next.floorMinImageEndFloor = endInput.value;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };
  startInput.addEventListener("change", saveRange);
  endInput.addEventListener("change", saveRange);
  tableSummary.querySelector("#floorMinImageButton").addEventListener("click", () => {
    saveRange();
    generateFloorMinScoreImage(startInput.value, endInput.value);
  });
  tableSummary.hidden = false;
}

function renderFloorSelect(id, floors, selected) {
  const options = (floors.length ? floors : floorLabels)
    .map((floor) => `<option value="${escapeHtml(floor)}"${floor === selected ? " selected" : ""}>${escapeHtml(floor)}</option>`)
    .join("");
  return `<select id="${id}" class="compactSelect">${options}</select>`;
}

function getAvailableFloorLabels(rows) {
  return [...new Set(rows.map(getFloorLabel).filter(Boolean))]
    .sort((a, b) => floorIndex(a) - floorIndex(b));
}

function filterRecordsForFloorImage(records) {
  const button = buttonFilter.value;
  const pattern = patternFilter.value;
  const query = searchInput.value.trim().toLowerCase();
  return records.filter((row) => {
    if (button && String(row.button) !== button) return false;
    if (pattern && String(row.pattern || "") !== pattern) return false;
    if (!getFloorLabel(row)) return false;
    if (!query) return true;
    return JSON.stringify(row).toLowerCase().includes(query);
  });
}

function getCatalogPatternCount(floorLabel) {
  if (!state.floorPatternCounts) return null;
  const selectedButtons = buttonFilter.value ? [String(buttonFilter.value)] : BUTTONS.map(String);
  const selectedPattern = patternFilter.value;
  let total = 0;
  for (const button of selectedButtons) {
    const patterns = state.floorPatternCounts[button] || {};
    for (const [patternName, floors] of Object.entries(patterns)) {
      if (selectedPattern && patternName !== selectedPattern) continue;
      total += Number(floors?.[floorLabel] || 0);
    }
  }
  return total;
}

function getCatalogButtonsForFloor(floorLabel) {
  if (!state.floorPatternCounts) return [];
  const selectedButtons = buttonFilter.value ? [String(buttonFilter.value)] : BUTTONS.map(String);
  const selectedPattern = patternFilter.value;
  return selectedButtons.filter((button) => {
    const patterns = state.floorPatternCounts[button] || {};
    return Object.entries(patterns).some(([patternName, floors]) => {
      if (selectedPattern && patternName !== selectedPattern) return false;
      return Number(floors?.[floorLabel] || 0) > 0;
    });
  });
}

function renderTop100Metric(button, rows) {
  const sum = rows
    .filter((row) => String(row.button) === button && row.rank <= 50)
    .reduce((total, row) => total + Number(row.logPower || 0), 0);
  return `<div class="tableMetric tableMetricAction">
    <span>${button}B Top50 logPower</span>
    <strong>${sum.toFixed(2)}</strong>
    <button class="smallActionButton" type="button" data-top-image-button="${escapeHtml(button)}">Top30 이미지</button>
  </div>`;
}

function renderCompareSummary(rows) {
  const both = rows.filter((row) => row.mineScore !== null && row.otherScore !== null);
  const zBoth = both.filter((row) => Number.isFinite(row.zDiff));
  const logPowerBoth = both.filter((row) => Number.isFinite(row.logPowerDiff));
  const pointBoth = both.filter((row) => Number.isFinite(row.pointDiff));
  const scoreMine = both.filter((row) => row.scoreDiff > 0).length;
  const scoreOther = both.filter((row) => row.scoreDiff < 0).length;
  const zMine = zBoth.filter((row) => row.zDiff > 0).length;
  const zOther = zBoth.filter((row) => row.zDiff < 0).length;
  const logPowerMine = logPowerBoth.filter((row) => row.logPowerDiff > 0).length;
  const logPowerOther = logPowerBoth.filter((row) => row.logPowerDiff < 0).length;
  const pointMine = pointBoth.filter((row) => row.pointDiff > 0).length;
  const pointOther = pointBoth.filter((row) => row.pointDiff < 0).length;
  const reversals = both.filter((row) => row.isReversal).length;
  const avgZDiff = zBoth.length ? zBoth.reduce((sum, row) => sum + row.zDiff, 0) / zBoth.length : 0;
  const cards = [
    ["비교 대상", state.comparePayload?.nickname || "-"],
    ["공통 기록", both.length],
    ["score 내가 우위", scoreMine],
    ["score 상대 우위", scoreOther],
    ["z 내가 우위", zMine],
    ["z 상대 우위", zOther],
    ["logPower 내가 우위", logPowerMine],
    ["logPower 상대 우위", logPowerOther],
    ["Point 내가 우위", pointMine],
    ["Point 상대 우위", pointOther],
    ["역전", reversals],
    ["평균 z 차이", avgZDiff.toFixed(2)],
    ...buildDjClassCompareCards(),
  ];
  tableSummary.innerHTML = cards
    .map(([label, value]) => `<div class="tableMetric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`)
    .join("");
  tableSummary.hidden = false;
}

function buildDjClassCompareCards() {
  const selectedButton = buttonFilter.value;
  const buttons = selectedButton ? [Number(selectedButton)] : BUTTONS;
  const mineByButton = new Map((state.payload?.djClasses || []).map((row) => [Number(row.button), row]));
  const otherByButton = new Map((state.comparePayload?.djClasses || []).map((row) => [Number(row.button), row]));
  return buttons.map((button) => {
    const mine = mineByButton.get(button);
    const other = otherByButton.get(button);
    const mineClass = mine?.djClass || "-";
    const otherClass = other?.djClass || "-";
    const minePower = formatDjClassPower(mine?.djPowerSum);
    const otherPower = formatDjClassPower(other?.djPowerSum);
    return [`${button}B DJ Class`, `내 ${mineClass} (${minePower}) / 상대 ${otherClass} (${otherPower})`];
  });
}

function formatDjClassPower(value) {
  return Number.isFinite(Number(value)) ? Number(value).toFixed(2) : "-";
}

function applyNameWidth() {
  document.documentElement.style.setProperty("--name-col-width", `${nameWidthInput.value}px`);
}

function getRowsForView(view) {
  if (view === "compare") return buildCompareRows();
  if (view === "top100") return buildTop100Rows(state.payload.records || []);
  if (view === "history") return [...state.historyRows];
  if (view === "selfCompare") return [...state.selfCompareRows];
  return [...(state.payload[view] || [])];
}

function buildTop100Rows(records) {
  const selectedButton = buttonFilter.value;
  const buttons = selectedButton ? [selectedButton] : ["4", "5", "6", "8"];
  return buttons.flatMap((button) => buildTopRowsForButton(records, button, 0));
}

function buildTopRowsForButton(records, button, limit = 100) {
  const rows = records
    .filter((row) => String(row.button) === String(button))
    .map((row) => {
      const scorePoint = scoreToPoint(Number(row.score));
      const floorLabel = getFloorLabel(row);
      const difficultyConstant = difficultyConstantForFloor(floorLabel, button);
      const logPower = scorePoint * difficultyConstant;
      const floorMaxPoint = 10 * difficultyConstant;
      return {
        ...row,
        floorName: floorLabel || row.floorName,
        scorePoint,
        difficultyConstant,
        floorMaxPoint,
        logPower,
      };
    })
    .filter((row) => Number.isFinite(row.logPower))
    .sort((a, b) => b.logPower - a.logPower || b.scorePoint - a.scorePoint || compare(a.name, b.name));
  return (limit > 0 ? rows.slice(0, limit) : rows)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function calculateTop50LogPowerSum(records, button) {
  return buildTopRowsForButton(records, button, 50)
    .reduce((sum, row) => sum + Number(row.logPower || 0), 0);
}

async function generateTopImage(button) {
  if (!state.payload) return;
  setBusy(true, `${button}B Top30 이미지 생성 중`);
  try {
    const topRows = buildTopRowsForButton(state.payload.records || [], button, 100);
    const top50Sum = topRows
      .filter((row) => row.rank <= 50)
      .reduce((sum, row) => sum + Number(row.logPower || 0), 0);
    const canvas = await drawTopImage({
      button,
      nickname: state.payload.nickname || getCurrentNickname(),
      top50Sum,
      rows: topRows.slice(0, TOP_IMAGE_COUNT),
    });
    const copied = await saveCanvasImage(canvas, `v-archive-${state.payload.nickname || "user"}-${button}B-top30.png`);
    statusText.textContent = `${button}B Top30 이미지를 다운로드했습니다.${copied ? " 클립보드에도 복사했습니다." : ""}`;
  } catch (error) {
    statusText.textContent = `이미지 생성 오류: ${error.message}`;
  } finally {
    setBusy(false);
  }
}

async function exportAchievementImage() {
  if (!state.payload || !state.achievementSelected.size) return;
  const selectedIds = state.achievementSelected;
  const selectedButton = buttonFilter.value;
  const rows = state.achievementRows
    .filter((row) => selectedIds.has(row.id))
    .filter((row) => !selectedButton || String(row.button) === selectedButton)
    .sort((a, b) => new Date(b.currentUpdatedAt) - new Date(a.currentUpdatedAt));
  if (!rows.length) return;
  const columns = Math.min(rows.length, Math.min(MAX_ACHIEVEMENT_COLUMNS, Math.max(1, Number(achievementColumnsInput.value) || 1)));
  setBusy(true, `최근 성과 ${rows.length}개 이미지 생성 중`);
  achievementImageButton.disabled = true;
  try {
    const canvas = await drawAchievementImage({
      nickname: state.payload.nickname || getCurrentNickname(),
      rows,
      columns,
      profile: buildAchievementProfileSummary(),
    });
    const copied = await saveCanvasImage(canvas, `v-archive-${state.payload.nickname || "user"}-recent-achievements.png`);
    statusText.textContent = `최근 성과 ${rows.length}개 이미지를 다운로드했습니다.${copied ? " 클립보드에도 복사했습니다." : ""}`;
  } catch (error) {
    statusText.textContent = `최근 성과 이미지 생성 오류: ${error.message || error}`;
  } finally {
    setBusy(false);
    achievementImageButton.disabled = !getVisibleAchievementRows().some((row) => state.achievementSelected.has(row.id));
  }
}

function buildAchievementProfileSummary() {
  const tiers = new Map((state.payload?.tiers || []).map((row) => [Number(row.button), row]));
  const djClasses = new Map((state.payload?.djClasses || []).map((row) => [Number(row.button), row]));
  const selectedButton = Number(buttonFilter.value);
  const buttons = selectedButton ? [selectedButton] : BUTTONS;
  return {
    records: selectedButton
      ? Number(state.payload?.summary?.byButton?.[String(selectedButton)]?.records ?? 0)
      : Number(state.payload?.summary?.records ?? state.payload?.records?.length ?? 0),
    updated: Number(state.payload?.sync?.updatedRecords ?? 0),
    since: state.payload?.sync?.since || "full",
    errors: Number(state.payload?.summary?.errors ?? 0),
    selectedButton,
    buttons: buttons.map((button) => {
      const tier = tiers.get(button);
      const djClass = djClasses.get(button);
      return {
        button,
        records: Number(state.payload?.summary?.byButton?.[String(button)]?.records ?? 0),
        tierName: tier?.tierName || "-",
        tierPoint: tier?.tierPoint,
        djClass: djClass?.djClass || "-",
        djPowerSum: djClass?.djPowerSum,
        top50LogPower: calculateTop50LogPowerSum(state.payload?.records || [], button),
      };
    }),
  };
}

async function drawAchievementImage({ nickname, rows, columns, profile }) {
  const margin = 30;
  const gap = 16;
  const cardW = 540;
  const cardH = 400;
  const width = margin * 2 + columns * cardW + Math.max(0, columns - 1) * gap;
  const profileGap = 10;
  const profileColumns = Math.min(profile.buttons.length, Math.max(1, Math.floor((width - margin * 2 + profileGap) / 260)));
  const profileRows = Math.ceil(profile.buttons.length / profileColumns);
  const headerH = 166 + profileRows * 100 + Math.max(0, profileRows - 1) * profileGap;
  const rowCount = Math.ceil(rows.length / columns);
  const height = margin * 2 + headerH + rowCount * cardH + Math.max(0, rowCount - 1) * gap;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f4f6f8";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#151922";
  ctx.font = "900 42px Segoe UI, Malgun Gothic, Arial";
  ctx.fillText("V-ARCHIVE RECENT ACHIEVEMENTS", margin, 56);
  ctx.fillStyle = "#1268b3";
  ctx.font = "900 32px Segoe UI, Malgun Gothic, Arial";
  ctx.fillText(nickname, margin, 98);
  ctx.fillStyle = "#586274";
  ctx.font = "600 19px Segoe UI, Malgun Gothic, Arial";
  const buttonScope = profile.selectedButton ? ` · ${profile.selectedButton}B 선택` : "";
  ctx.fillText(`${rows.length}개 성과${buttonScope} · Records ${profile.records.toLocaleString()} · Updated ${profile.updated.toLocaleString()} · Since ${profile.since} · Errors ${profile.errors.toLocaleString()} · ${formatDate(new Date().toISOString())}`, margin, 128);

  const profileAreaW = profile.buttons.length === 1 ? Math.min(cardW, width - margin * 2) : width - margin * 2;
  const profileW = (profileAreaW - profileGap * Math.max(0, profileColumns - 1)) / profileColumns;
  for (let index = 0; index < profile.buttons.length; index += 1) {
    const item = profile.buttons[index];
    const profileColumn = index % profileColumns;
    const profileRow = Math.floor(index / profileColumns);
    const x = margin + profileColumn * (profileW + profileGap);
    const y = 148 + profileRow * (100 + profileGap);
    drawRoundRect(ctx, x, y, profileW, 100, 7, "#ffffff", "#d9dee7");
    ctx.fillStyle = "#1268b3";
    ctx.font = "900 21px Segoe UI, Malgun Gothic, Arial";
    ctx.fillText(`${item.button}B`, x + 12, y + 28);
    ctx.fillStyle = "#171a1f";
    ctx.font = "800 15px Segoe UI, Malgun Gothic, Arial";
    drawTextFit(ctx, `Tier ${item.tierName} · DJ ${item.djClass}`, x + 64, y + 27, profileW - 76);
    ctx.fillStyle = "#586274";
    ctx.font = "700 13px Segoe UI, Malgun Gothic, Arial";
    drawTextFit(ctx, `Records ${item.records.toLocaleString()} · LP50 ${formatProfileNumber(item.top50LogPower)}`, x + 12, y + 56, profileW - 24);
    drawTextFit(ctx, `TierPoint ${formatProfileNumber(item.tierPoint)} · DJPower ${formatProfileNumber(item.djPowerSum)}`, x + 12, y + 80, profileW - 24);
  }

  const jackets = await Promise.all(rows.map((row) => loadImage(getJacketUrl(row))));
  for (let index = 0; index < rows.length; index += 1) {
    const column = index % columns;
    const rowIndex = Math.floor(index / columns);
    const x = margin + column * (cardW + gap);
    const y = margin + headerH + rowIndex * (cardH + gap);
    drawAchievementImageCard(ctx, rows[index], jackets[index], x, y, cardW, cardH);
  }
  return canvas;
}

function drawAchievementImageCard(ctx, row, jacket, x, y, w, h) {
  drawRoundRect(ctx, x, y, w, h, 8, "#ffffff", "#d9dee7");
  const inset = 10;
  const songH = 140;
  drawRoundRect(ctx, x + inset, y + inset, w - inset * 2, songH, 7, "#f7f9fc", "#e2e7ef");

  const jacketSize = 112;
  const jacketX = x + 22;
  const jacketY = y + 23;
  if (jacket) {
    ctx.save();
    roundedClip(ctx, jacketX, jacketY, jacketSize, jacketSize, 7);
    ctx.drawImage(jacket, jacketX, jacketY, jacketSize, jacketSize);
    ctx.restore();
  } else {
    drawRoundRect(ctx, jacketX, jacketY, jacketSize, jacketSize, 7, "#e8edf3", "#d3dae5");
    ctx.fillStyle = "#687282";
    ctx.font = "800 15px Segoe UI, Malgun Gothic, Arial";
    drawTextFit(ctx, "NO JACKET", jacketX + 12, jacketY + 60, jacketSize - 24);
  }

  const textX = jacketX + jacketSize + 18;
  const textW = w - (textX - x) - 24;
  ctx.fillStyle = "#171a1f";
  ctx.font = "900 23px Segoe UI, Malgun Gothic, Arial";
  drawTextFit(ctx, row.name, textX, y + 48, textW);
  ctx.fillStyle = "#586274";
  ctx.font = "800 14px Segoe UI, Malgun Gothic, Arial";
  drawTextFit(ctx, `${row.button}B · ${row.pattern} · Lv.${row.level} · floor ${row.floorName}`, textX, y + 76, textW);
  ctx.fillStyle = "#1268b3";
  ctx.font = "900 16px Segoe UI, Malgun Gothic, Arial";
  drawTextFit(ctx, `Score ${formatSigned(row.scoreDiff, 2)} · LP ${formatSigned(row.logPowerDiff, 2)} · Point ${formatSigned(row.scorePointDiff, 2)}`, textX, y + 106, textW);
  ctx.fillStyle = "#586274";
  ctx.font = "800 14px Segoe UI, Malgun Gothic, Arial";
  drawTextFit(ctx, formatAchievementElapsed(row.previousUpdatedAt, row.currentUpdatedAt), textX, y + 129, textW);

  const compareY = y + inset + songH + 10;
  const sideGap = 10;
  const sideW = (w - inset * 2 - sideGap) / 2;
  const sideH = h - (compareY - y) - inset;
  drawAchievementImageSide(ctx, "이전", row.previousUpdatedAt, row.previousScore, row.previousScorePoint, row.previousLogPower, row.previousMaxCombo, x + inset, compareY, sideW, sideH, false);
  drawAchievementImageSide(ctx, "현재", row.currentUpdatedAt, row.currentScore, row.currentScorePoint, row.currentLogPower, row.currentMaxCombo, x + inset + sideW + sideGap, compareY, sideW, sideH, true);
}

function drawAchievementImageSide(ctx, label, updatedAt, score, scorePoint, logPower, maxCombo, x, y, w, h, after) {
  drawRoundRect(ctx, x, y, w, h, 7, after ? "#eef6fc" : "#f7f9fc", after ? "#b9d7ee" : "#e2e7ef");
  ctx.fillStyle = after ? "#1268b3" : "#687282";
  ctx.font = "900 19px Segoe UI, Malgun Gothic, Arial";
  ctx.fillText(label, x + 16, y + 30);
  ctx.fillStyle = "#586274";
  ctx.font = "700 13px Segoe UI, Malgun Gothic, Arial";
  drawTextFit(ctx, formatDate(updatedAt), x + 16, y + 54, w - 32);
  ctx.fillStyle = after ? "#1268b3" : "#171a1f";
  ctx.font = "900 38px Segoe UI, Malgun Gothic, Arial";
  ctx.fillText(formatValue(score, "score"), x + 16, y + 105);
  ctx.fillStyle = "#586274";
  ctx.font = "800 15px Segoe UI, Malgun Gothic, Arial";
  ctx.fillText(`scorePoint ${formatProfileNumber(scorePoint)}`, x + 16, y + 143);
  ctx.fillText(`logPower ${formatProfileNumber(logPower)}`, x + 16, y + 171);
  if (maxCombo) {
    ctx.fillStyle = "#1268b3";
    ctx.font = "900 16px Segoe UI, Malgun Gothic, Arial";
    ctx.fillText("MAX COMBO", x + 16, y + h - 18);
  }
}

function formatAchievementElapsed(startValue, endValue) {
  const start = new Date(startValue).getTime();
  const end = new Date(endValue).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return "";
  const hours = Math.round((end - start) / 3600000);
  if (hours < 24) return `이전 기록 후 ${hours}시간`;
  return `이전 기록 후 ${Math.round(hours / 24)}일`;
}

function formatProfileNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value).toFixed(2) : "-";
}

async function generateFloorMinScoreImage(startFloor, endFloor) {
  const records = state.floorMinImageRecords?.length ? state.floorMinImageRecords : filterRecordsForFloorImage(state.payload?.records || []);
  if (!records.length) return;
  const startIndex = floorIndex(startFloor);
  const endIndex = floorIndex(endFloor);
  const descending = startIndex > endIndex;
  const rangeStart = Math.min(startIndex, endIndex);
  const rangeEnd = Math.max(startIndex, endIndex);
  const floors = buildFloorImageSummaries(records, rangeStart, rangeEnd, descending);
  if (!floors.length) {
    statusText.textContent = `선택한 floor 범위에 표시할 기록이 없습니다.`;
    return;
  }
  const start = floorLabels[startIndex] || startFloor;
  const end = floorLabels[endIndex] || endFloor;
  setBusy(true, `FloorMinScore 이미지 생성 중`);
  try {
    const canvas = await drawFloorMinScoreImage({
      nickname: state.payload?.nickname || getCurrentNickname(),
      floors,
      start,
      end,
    });
    const copied = await saveCanvasImage(canvas, `v-archive-${state.payload?.nickname || "user"}-floor-min-${start}-${end}.png`);
    statusText.textContent = `FloorMinScore 이미지를 다운로드했습니다.${copied ? " 클립보드에도 복사했습니다." : ""}`;
  } catch (error) {
    statusText.textContent = `이미지 생성 오류: ${error.message}`;
  } finally {
    setBusy(false);
  }
}

function buildFloorImageSummaries(records, startIndex, endIndex, descending = false) {
  const grouped = new Map();
  for (const record of records) {
    const floorLabel = getFloorLabel(record);
    const index = floorIndex(floorLabel);
    if (index < 0) continue;
    if (!grouped.has(floorLabel)) grouped.set(floorLabel, []);
    grouped.get(floorLabel).push(record);
  }
  const summaries = new Map([...grouped.entries()].map(([floorLabel, floorRecords]) => {
    const scored = floorRecords
      .filter((record) => record.score !== null && record.score !== undefined && record.score !== "")
      .map((record) => {
        const scoreValue = Number(record.score);
        const difficultyConstant = difficultyConstantForFloor(floorLabel, record.button);
        return {
          ...record,
          scoreValue,
          logPower: scoreToPoint(scoreValue) * difficultyConstant,
          floorMaxPoint: 10 * difficultyConstant,
        };
      })
      .filter((record) => Number.isFinite(record.scoreValue));
    const patternKeys = new Set(floorRecords.map((record) => recordKey(record)));
    const scoredPatternCount = new Set(scored.map((record) => recordKey(record))).size;
    const catalogPatternCount = getCatalogPatternCount(floorLabel);
    const totalPatternCount = catalogPatternCount === null ? patternKeys.size : Math.max(patternKeys.size, catalogPatternCount);
    const scores = scored.map((record) => record.scoreValue);
    const avg = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null;
    const variance = scores.length ? scores.reduce((sum, score) => sum + (score - avg) ** 2, 0) / scores.length : null;
    const sorted = scored.sort((a, b) => b.scoreValue - a.scoreValue || compare(a.name, b.name));
    const catalogButtons = getCatalogButtonsForFloor(floorLabel);
    const floorButtons = catalogButtons.length ? catalogButtons : [...new Set(floorRecords.map((record) => String(record.button)))];
    const floorMaxPoints = floorButtons
      .map((button) => 10 * difficultyConstantForFloor(floorLabel, button))
      .filter(Number.isFinite);
    return [floorLabel, {
      floorLabel,
      buttons: [...new Set(floorRecords.map((record) => `${record.button}B`))].sort((a, b) => compare(a, b)).join(" / "),
      recordCount: scoredPatternCount,
      totalPatternCount,
      completionRate: totalPatternCount ? (scoredPatternCount / totalPatternCount) * 100 : null,
      avg,
      std: variance === null ? null : Math.sqrt(variance),
      floorMaxMin: floorMaxPoints.length ? Math.min(...floorMaxPoints) : null,
      floorMaxMax: floorMaxPoints.length ? Math.max(...floorMaxPoints) : null,
      max: sorted[0] || null,
      min: sorted[sorted.length - 1] || null,
    }];
  }));

  return [...summaries.values()]
    .filter(({ floorLabel }) => {
      const index = floorIndex(floorLabel);
      return index >= startIndex && index <= endIndex;
    })
    .sort((a, b) => (floorIndex(a.floorLabel) - floorIndex(b.floorLabel)) * (descending ? -1 : 1))
    .map((summary) => {
      const upper = summaries.get(floorLabels[floorIndex(summary.floorLabel) + 1]);
      const upperMin = upper?.min?.scoreValue;
      const currentMin = summary.min?.scoreValue;
      return {
        ...summary,
        upperFloorLabel: upper?.floorLabel || null,
        upperMin: Number.isFinite(upperMin) ? upperMin : null,
        upperMinGap: Number.isFinite(upperMin) && Number.isFinite(currentMin) ? upperMin - currentMin : null,
      };
    });
}

async function drawFloorMinScoreImage({ nickname, floors, start, end }) {
  const margin = 24;
  const headerH = 150;
  const rowH = 142;
  const gap = 8;
  const width = 1420;
  const height = margin * 2 + headerH + floors.length * rowH + Math.max(0, floors.length - 1) * gap;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f4f6f8";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#151922";
  ctx.font = "800 42px Segoe UI, Malgun Gothic, Arial";
  ctx.fillText("V-ARCHIVE FloorMinScore", margin, 58);
  ctx.font = "500 24px Segoe UI, Malgun Gothic, Arial";
  ctx.fillStyle = "#4d5868";
  ctx.fillText(`${nickname} · floor ${start}-${end} · ${formatDate(new Date().toISOString())}`, margin, 96);
  ctx.font = "800 26px Segoe UI, Malgun Gothic, Arial";
  ctx.fillStyle = "#1268b3";
  ctx.fillText(`${floors.length} floor summaries`, margin, 128);

  const tableW = width - margin * 2;
  const recordW = 472;
  const centerW = tableW - recordW * 2 - 24;
  const labelY = margin + headerH - 14;
  ctx.font = "900 18px Segoe UI, Malgun Gothic, Arial";
  ctx.fillStyle = "#159b72";
  ctx.fillText("최고점", margin + 14, labelY);
  ctx.fillStyle = "#1268b3";
  ctx.textAlign = "center";
  ctx.fillText("floor 정보", margin + recordW + 12 + centerW / 2, labelY);
  ctx.textAlign = "right";
  ctx.fillStyle = "#c03535";
  ctx.fillText("최저점", width - margin - 14, labelY);
  ctx.textAlign = "left";

  for (let index = 0; index < floors.length; index += 1) {
    const y = margin + headerH + index * (rowH + gap);
    await drawFloorSummaryCard(ctx, floors[index], margin, y, width - margin * 2, rowH);
  }

  return canvas;
}

async function drawFloorSummaryCard(ctx, floor, x, y, w, h) {
  drawRoundRect(ctx, x, y, w, h, 8, "#ffffff", "#d9dee7");
  const recordW = 472;
  const centerW = w - recordW * 2 - 24;
  await drawFloorRecordPanel(ctx, floor.max, x + 10, y + 10, recordW - 10, h - 20, "#159b72");
  drawFloorInfoPanel(ctx, floor, x + recordW + 12, y + 10, centerW, h - 20);
  await drawFloorRecordPanel(ctx, floor.min, x + recordW + centerW + 22, y + 10, recordW - 10, h - 20, "#c03535");
}

async function drawFloorRecordPanel(ctx, row, x, y, w, h, color) {
  drawRoundRect(ctx, x, y, w, h, 8, "#f7f9fc", "#e2e7ef");
  if (!row) {
    ctx.fillStyle = "#687282";
    ctx.font = "700 16px Segoe UI, Malgun Gothic, Arial";
    ctx.fillText("기록 없음", x + 12, y + 62);
    return;
  }

  const jacketSize = 88;
  const jacketX = x + 10;
  const jacketY = y + 12;
  const image = await loadImage(getJacketUrl(row));
  if (image) {
    ctx.save();
    roundedClip(ctx, jacketX, jacketY, jacketSize, jacketSize, 7);
    ctx.drawImage(image, jacketX, jacketY, jacketSize, jacketSize);
    ctx.restore();
  } else {
    drawRoundRect(ctx, jacketX, jacketY, jacketSize, jacketSize, 7, "#e8edf3", "#d3dae5");
    ctx.fillStyle = "#677386";
    ctx.font = "700 13px Segoe UI, Malgun Gothic, Arial";
    drawTextFit(ctx, "NO JACKET", jacketX + 8, jacketY + 50, jacketSize - 16);
  }

  const textX = jacketX + jacketSize + 12;
  const scoreW = 126;
  ctx.fillStyle = "#171a1f";
  ctx.font = "800 18px Segoe UI, Malgun Gothic, Arial";
  drawTextFit(ctx, row.name || "", textX, y + 35, w - jacketSize - scoreW - 40);
  ctx.fillStyle = "#586274";
  ctx.font = "700 14px Segoe UI, Malgun Gothic, Arial";
  drawTextFit(ctx, `${row.pattern || ""} · Lv.${row.level ?? ""} · ${row.button}B`, textX, y + 59, w - jacketSize - scoreW - 40);
  ctx.fillStyle = "#687282";
  ctx.font = "700 13px Segoe UI, Malgun Gothic, Arial";
  drawTextFit(ctx, `${row.maxCombo === true ? "MAX COMBO · " : ""}${formatDate(row.updatedAt) || "-"}`, textX, y + 83, w - jacketSize - scoreW - 40);
  ctx.fillStyle = row.maxCombo === true ? "#159b72" : color;
  ctx.font = "900 24px Segoe UI, Malgun Gothic, Arial";
  ctx.textAlign = "right";
  ctx.fillText(formatValue(row.scoreValue ?? row.score, "score"), x + w - 14, y + 57);
  ctx.fillStyle = "#1268b3";
  ctx.font = "800 14px Segoe UI, Malgun Gothic, Arial";
  ctx.fillText(`logPower ${formatValue(row.logPower, "logPower")}`, x + w - 14, y + 84);
  ctx.textAlign = "left";
}

function drawFloorInfoPanel(ctx, floor, x, y, w, h) {
  drawRoundRect(ctx, x, y, w, h, 8, "#ffffff", null);
  const completionRatio = Math.min(1, Math.max(0, Number(floor.completionRate || 0) / 100));
  if (completionRatio > 0) {
    const fillW = w * completionRatio;
    ctx.save();
    roundedClip(ctx, x, y, w, h, 8);
    ctx.fillStyle = completionRatio >= 1 ? "#aee6cc" : "#d5f1e5";
    ctx.fillRect(x, y, fillW, h);
    ctx.restore();
  }
  drawRoundRect(ctx, x, y, w, h, 8, null, "#d9dee7");
  ctx.fillStyle = "#1268b3";
  ctx.font = "900 30px Segoe UI, Malgun Gothic, Arial";
  ctx.fillText(floor.floorLabel, x + 12, y + 35);
  ctx.fillStyle = "#687282";
  ctx.font = "800 13px Segoe UI, Malgun Gothic, Arial";
  ctx.textAlign = "right";
  ctx.fillText(floor.buttons || "전체 버튼", x + w - 12, y + 32);
  ctx.textAlign = "left";

  const gridY = y + 44;
  const gridH = h - 52;
  const cellW = w / 3;
  const cellH = gridH / 2;
  const gapText = formatUpperFloorGap(floor.upperMinGap);
  const cells = [
    ["기록", `${floor.recordCount}/${floor.totalPatternCount} (${formatPercent(floor.completionRate)})`],
    ["평균", formatFloorStat(floor.avg)],
    ["표준편차", formatFloorStat(floor.std)],
    ["floorMax", formatFloorMaxRange(floor.floorMaxMin, floor.floorMaxMax)],
    [`상위 ${floor.upperFloorLabel || "floor"} 최저`, formatFloorStat(floor.upperMin)],
    ["상위 최저 대비", gapText],
  ];

  for (let index = 0; index < cells.length; index += 1) {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const cellX = x + column * cellW;
    const cellY = gridY + row * cellH;
    ctx.strokeStyle = "#d9dee7";
    ctx.lineWidth = 1;
    ctx.strokeRect(cellX, cellY, cellW, cellH);
    ctx.fillStyle = "#687282";
    ctx.font = "700 11px Segoe UI, Malgun Gothic, Arial";
    drawTextFit(ctx, cells[index][0], cellX + 8, cellY + 14, cellW - 16);
    ctx.fillStyle = index === 5 && Number(floor.upperMinGap) > 0 ? "#c03535" : "#171a1f";
    ctx.font = "900 15px Segoe UI, Malgun Gothic, Arial";
    drawTextFit(ctx, cells[index][1], cellX + 8, cellY + 34, cellW - 16);
  }
}

function formatPercent(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (!Number.isFinite(Number(value))) return "-";
  return `${Number(value).toFixed(1).replace(/\.0$/, "")}%`;
}

function formatUpperFloorGap(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (!Number.isFinite(Number(value))) return "-";
  const amount = formatFloorStat(Math.abs(Number(value)));
  if (Number(value) > 0) return `${amount} 낮음`;
  if (Number(value) < 0) return `${amount} 높음`;
  return "동일";
}

function formatFloorMaxRange(min, max) {
  if (!Number.isFinite(Number(min)) || !Number.isFinite(Number(max))) return "-";
  const minText = formatValue(min, "floorMaxPoint");
  const maxText = formatValue(max, "floorMaxPoint");
  return Math.abs(Number(max) - Number(min)) < 0.005 ? minText : `${minText} - ${maxText}`;
}

async function drawTopImage({ button, nickname, top50Sum, rows }) {
  const margin = 34;
  const gap = 18;
  const headerH = 150;
  const cardW = 260;
  const cardH = 365;
  const width = margin * 2 + TOP_IMAGE_COLUMNS * cardW + (TOP_IMAGE_COLUMNS - 1) * gap;
  const height = margin * 2 + headerH + TOP_IMAGE_ROWS * cardH + (TOP_IMAGE_ROWS - 1) * gap;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f4f6f8";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#151922";
  ctx.font = "700 42px Segoe UI, Malgun Gothic, Arial";
  ctx.fillText(`V-ARCHIVE ${button}B Top30`, margin, 58);
  ctx.font = "500 24px Segoe UI, Malgun Gothic, Arial";
  ctx.fillStyle = "#4d5868";
  ctx.fillText(`${nickname} · ${formatDate(new Date().toISOString())}`, margin, 94);
  ctx.font = "900 40px Segoe UI, Malgun Gothic, Arial";
  ctx.fillStyle = "#1268b3";
  ctx.fillText(`Top50 logPower ${top50Sum.toFixed(2)}`, margin, 136);

  for (let index = 0; index < TOP_IMAGE_COUNT; index += 1) {
    const row = rows[index];
    const col = index % TOP_IMAGE_COLUMNS;
    const rowIndex = Math.floor(index / TOP_IMAGE_COLUMNS);
    const x = margin + col * (cardW + gap);
    const y = margin + headerH + rowIndex * (cardH + gap);
    await drawTopCard(ctx, row, x, y, cardW, cardH);
  }

  return canvas;
}

async function drawTopCard(ctx, row, x, y, w, h) {
  drawRoundRect(ctx, x, y, w, h, 12, "#ffffff", "#d9dee7");
  if (!row) {
    ctx.fillStyle = "#8a94a4";
    ctx.font = "600 20px Segoe UI, Malgun Gothic, Arial";
    ctx.fillText("-", x + 22, y + 54);
    return;
  }

  const jacketSize = 220;
  const jacketX = x + (w - jacketSize) / 2;
  const jacketY = y + 18;
  const image = await loadImage(getJacketUrl(row));
  if (image) {
    ctx.save();
    roundedClip(ctx, jacketX, jacketY, jacketSize, jacketSize, 10);
    ctx.drawImage(image, jacketX, jacketY, jacketSize, jacketSize);
    ctx.restore();
  } else {
    drawRoundRect(ctx, jacketX, jacketY, jacketSize, jacketSize, 10, "#e8edf3", "#d3dae5");
    ctx.fillStyle = "#677386";
    ctx.font = "700 22px Segoe UI, Malgun Gothic, Arial";
    drawTextFit(ctx, row.name || "NO JACKET", jacketX + 16, jacketY + 106, jacketSize - 32);
  }

  ctx.fillStyle = "rgba(21, 25, 34, 0.82)";
  ctx.fillRect(jacketX, jacketY + jacketSize - 36, jacketSize, 36);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 22px Segoe UI, Malgun Gothic, Arial";
  ctx.fillText(`#${row.rank}`, jacketX + 12, jacketY + jacketSize - 11);
  if (row.maxCombo === true) {
    ctx.fillStyle = "#4EEEAF";
    ctx.font = "800 15px Segoe UI, Malgun Gothic, Arial";
    ctx.fillText("MAX COMBO", jacketX + 96, jacketY + jacketSize - 13);
  }

  const textX = x + 16;
  let textY = y + 266;
  ctx.fillStyle = "#171a1f";
  ctx.font = "700 18px Segoe UI, Malgun Gothic, Arial";
  drawTextFit(ctx, row.name || "", textX, textY, w - 32);
  textY += 25;
  ctx.fillStyle = "#586274";
  ctx.font = "600 15px Segoe UI, Malgun Gothic, Arial";
  drawTextFit(ctx, `${row.pattern || ""} · Lv.${row.level ?? ""} · floor ${row.floorName || ""}`, textX, textY, w - 32);
  textY += 24;
  ctx.fillStyle = "#171a1f";
  ctx.font = "700 16px Segoe UI, Malgun Gothic, Arial";
  drawTextFit(ctx, `score ${formatValue(row.score, "score")}`, textX, textY, w - 32);
  textY += 23;
  ctx.fillStyle = "#1268b3";
  ctx.font = "800 17px Segoe UI, Malgun Gothic, Arial";
  drawTextFit(ctx, `${formatValue(row.logPower, "logPower")} / ${formatValue(row.floorMaxPoint, "floorMaxPoint")}`, textX, textY, w - 32);
}

function getJacketUrl(row) {
  return `https://djmax.gg/images/jackets/128/${encodeURIComponent(row.title)}.webp`;
}

function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

async function saveCanvasImage(canvas, fileName) {
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("이미지를 만들 수 없습니다."))), "image/png");
  });
  let copied = false;
  if (navigator.clipboard?.write && window.ClipboardItem) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      copied = true;
    } catch {
      copied = false;
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return copied;
}

function drawRoundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function roundedClip(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.clip();
}

function drawTextFit(ctx, text, x, y, maxWidth) {
  const value = String(text || "");
  if (ctx.measureText(value).width <= maxWidth) {
    ctx.fillText(value, x, y);
    return;
  }
  let clipped = value;
  while (clipped.length > 1 && ctx.measureText(`${clipped}…`).width > maxWidth) clipped = clipped.slice(0, -1);
  ctx.fillText(`${clipped}…`, x, y);
}

function buildCompareRows() {
  if (!state.payload || !state.comparePayload) return [];
  const mineRecords = state.payload.records || [];
  const otherRecords = state.comparePayload.records || [];
  const mineStats = buildFloorStats(mineRecords);
  const otherStats = buildFloorStats(otherRecords);
  const mineMap = new Map(mineRecords.map((record) => [recordKey(record), record]));
  const otherMap = new Map(otherRecords.map((record) => [recordKey(record), record]));
  const keys = [...mineMap.keys()].filter((key) => otherMap.has(key));
  const minStd = Number(compareStdFloorSelect.value) || 0.05;

  return keys.map((key) => {
    const mine = mineMap.get(key) || null;
    const other = otherMap.get(key) || null;
    const base = mine || other || {};
    const mineScore = mine && Number.isFinite(Number(mine.score)) ? Number(mine.score) : null;
    const otherScore = other && Number.isFinite(Number(other.score)) ? Number(other.score) : null;
    const mineFloor = mine ? getFloorLabel(mine) : getFloorLabel(other || {});
    const otherFloor = other ? getFloorLabel(other) : getFloorLabel(mine || {});
    const mineZ = mineScore === null ? null : zScore(mineScore, mineStats.get(mineFloor), minStd);
    const otherZ = otherScore === null ? null : zScore(otherScore, otherStats.get(otherFloor), minStd);
    const scoreDiff = mineScore === null || otherScore === null ? null : mineScore - otherScore;
    const zDiff = mineZ === null || otherZ === null ? null : mineZ - otherZ;
    const button = Number(base.button);
    const mineLogPower = mineScore === null ? null : scoreToPoint(mineScore) * difficultyConstantForFloor(mineFloor, button);
    const otherLogPower = otherScore === null ? null : scoreToPoint(otherScore) * difficultyConstantForFloor(otherFloor, button);
    const logPowerDiff = Number.isFinite(mineLogPower) && Number.isFinite(otherLogPower) ? mineLogPower - otherLogPower : null;
    const minePoint = mine && Number.isFinite(Number(mine.rating)) ? Number(mine.rating) : null;
    const otherPoint = other && Number.isFinite(Number(other.rating)) ? Number(other.rating) : null;
    const pointDiff = minePoint === null || otherPoint === null ? null : minePoint - otherPoint;
    const isReversal = scoreDiff !== null && zDiff !== null && Math.sign(scoreDiff) !== 0 && Math.sign(zDiff) !== 0 && Math.sign(scoreDiff) !== Math.sign(zDiff);
    const floorName = getFloorLabel(base) || mineFloor || otherFloor;
    return {
      button: base.button,
      title: base.title,
      name: base.name,
      pattern: base.pattern,
      level: base.level,
      floor: base.floor,
      floorName,
      mineScore,
      otherScore,
      scoreDiff,
      mineZ,
      otherZ,
      zDiff,
      mineLogPower,
      otherLogPower,
      logPowerDiff,
      minePoint,
      otherPoint,
      pointDiff,
      absScoreDiff: scoreDiff === null ? null : Math.abs(scoreDiff),
      absZDiff: zDiff === null ? null : Math.abs(zDiff),
      absLogPowerDiff: logPowerDiff === null ? null : Math.abs(logPowerDiff),
      absPointDiff: pointDiff === null ? null : Math.abs(pointDiff),
      isReversal,
      result: compareResult(scoreDiff, zDiff, mineScore, otherScore),
      mineMaxCombo: mine?.maxCombo === true,
      otherMaxCombo: other?.maxCombo === true,
      mineUpdatedAt: mine?.updatedAt || "",
      otherUpdatedAt: other?.updatedAt || "",
    };
  }).filter((row) => floorIndex(row.floorName) >= 0);
}

function buildFloorStats(records) {
  const grouped = new Map();
  for (const record of records) {
    const floorLabel = getFloorLabel(record);
    const score = Number(record.score);
    if (!floorLabel || !Number.isFinite(score)) continue;
    if (!grouped.has(floorLabel)) grouped.set(floorLabel, []);
    grouped.get(floorLabel).push(score);
  }
  const stats = new Map();
  for (const [floorLabel, scores] of grouped) {
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + (score - avg) ** 2, 0) / scores.length;
    stats.set(floorLabel, { avg, std: Math.sqrt(variance), count: scores.length });
  }
  return stats;
}

function zScore(score, stats, minStd) {
  if (!stats || !Number.isFinite(score)) return null;
  const std = Math.max(stats.std || 0, minStd);
  return (score - stats.avg) / std;
}

function compareResult(scoreDiff, zDiff, mineScore, otherScore) {
  const scoreWinner = scoreDiff > 0 ? "score 나" : scoreDiff < 0 ? "score 상대" : "score 동점";
  const zWinner = zDiff > 0 ? "z 나" : zDiff < 0 ? "z 상대" : "z 동점";
  return `${scoreWinner} / ${zWinner}`;
}

function scoreToPoint(score) {
  if (!Number.isFinite(score)) return NaN;
  const capped = Math.min(score, 99.9);
  if (capped <= 97) return 0;
  const point = -Math.log((100 - capped) / 3) / Math.log(SCORE_BASE);
  return Math.max(0, Math.min(10, point));
}

function difficultyConstantForFloor(floorLabel, button) {
  const baseDifficultyConstant = baseDifficultyConstantForFloor(floorLabel);
  if (!Number.isFinite(baseDifficultyConstant)) return NaN;
  const baseMaxByButton = state.buttonTop50BaseMax || FALLBACK_BUTTON_TOP50_BASE_MAX;
  const baseTop50Max = Number(baseMaxByButton[String(button)]);
  const buttonMultiplier = Number.isFinite(baseTop50Max) && baseTop50Max > 0 ? TARGET_TOP50_MAX / baseTop50Max : 1;
  return baseDifficultyConstant * buttonMultiplier;
}

function baseDifficultyConstantForFloor(floorLabel) {
  const index = floorLabels.indexOf(floorLabel);
  const anchorIndex = floorLabels.indexOf(ANCHOR_FLOOR_LABEL);
  if (index < 0 || anchorIndex < 0) return NaN;
  return ANCHOR_DIFFICULTY_CONSTANT * Math.pow(FLOOR_STEP_RATIO, index - anchorIndex);
}

function currentFloorRelation() {
  return 1 / FLOOR_STEP_RATIO;
}

function clampDebugRatio(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return currentFloorRelation();
  return Math.min(0.98, Math.max(0.85, number));
}

function setDebugRatio(value) {
  const ratio = clampDebugRatio(value);
  const formatted = ratio.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  debugRatioInput.value = formatted;
  debugRatioRange.value = String(ratio);
}

function simulatedBaseDifficultyConstant(floorLabel, relation) {
  const index = floorLabels.indexOf(floorLabel);
  const anchorIndex = floorLabels.indexOf(ANCHOR_FLOOR_LABEL);
  if (index < 0 || anchorIndex < 0 || !Number.isFinite(relation) || relation <= 0) return NaN;
  return ANCHOR_DIFFICULTY_CONSTANT * Math.pow(1 / relation, index - anchorIndex);
}

function simulatedTop50BaseMaxByButton(relation) {
  if (!state.floorPatternCounts) return null;
  const result = {};
  for (const button of BUTTONS) {
    const values = [];
    const patterns = state.floorPatternCounts[String(button)] || {};
    for (const floors of Object.values(patterns)) {
      for (const [floorLabel, countValue] of Object.entries(floors || {})) {
        const floorMax = 10 * simulatedBaseDifficultyConstant(floorLabel, relation);
        const count = Math.max(0, Number(countValue) || 0);
        if (!Number.isFinite(floorMax)) continue;
        for (let index = 0; index < count; index += 1) values.push(floorMax);
      }
    }
    if (values.length < 50) return null;
    values.sort((a, b) => b - a);
    result[String(button)] = values.slice(0, 50).reduce((sum, value) => sum + value, 0);
  }
  return result;
}

function renderDebugView() {
  if (!state.payload || viewSelect.value !== "debug") return;
  const relation = clampDebugRatio(debugRatioInput.value);
  setDebugRatio(relation);
  debugRatioEquation.textContent = `현재 floor 10점 = 다음 floor ${(relation * 10).toFixed(2)}점`;
  const baseMaxByButton = simulatedTop50BaseMaxByButton(relation);
  const records = filterRows(state.payload.records || []);
  const selectedButtons = buttonFilter.value ? [Number(buttonFilter.value)] : BUTTONS;
  debugSummary.innerHTML = selectedButtons.map((button) => {
    const simulatedBaseMax = Number(baseMaxByButton?.[String(button)]);
    const multiplier = Number.isFinite(simulatedBaseMax) && simulatedBaseMax > 0
      ? TARGET_TOP50_MAX / simulatedBaseMax
      : NaN;
    const simulated = records
      .filter((record) => Number(record.button) === button)
      .map((record) => scoreToPoint(Number(record.score)) * simulatedBaseDifficultyConstant(getFloorLabel(record), relation) * multiplier)
      .filter(Number.isFinite)
      .sort((a, b) => b - a)
      .slice(0, 50)
      .reduce((sum, value) => sum + value, 0);
    const current = records
      .filter((record) => Number(record.button) === button)
      .map((record) => scoreToPoint(Number(record.score)) * difficultyConstantForFloor(getFloorLabel(record), button))
      .filter(Number.isFinite)
      .sort((a, b) => b - a)
      .slice(0, 50)
      .reduce((sum, value) => sum + value, 0);
    const value = Number.isFinite(multiplier) ? simulated : NaN;
    return `<div class="metric"><span>${button}B Top50 · 현재 ${current.toFixed(2)}</span><strong>${Number.isFinite(value) ? value.toFixed(2) : "곡 목록 필요"}</strong><span>${Number.isFinite(value) ? `차이 ${formatSigned(value - current, 2)}` : "정규화 정보를 불러오지 못했습니다."}</span></div>`;
  }).join("");

  renderDebugScatter(records, relation, baseMaxByButton);

  const rows = [...floorLabels].reverse().map((floorLabel) => {
    const current = 10 * baseDifficultyConstantForFloor(floorLabel);
    const simulated = 10 * simulatedBaseDifficultyConstant(floorLabel, relation);
    return `<tr><td>${floorLabel}</td><td class="num">${current.toFixed(2)}</td><td class="num">${simulated.toFixed(2)}</td><td class="num ${simulated >= current ? "positiveDiff" : "negativeDiff"}">${formatSigned(((simulated / current) - 1) * 100, 2)}%</td></tr>`;
  }).join("");
  debugFloorTable.innerHTML = `<thead><tr><th>floor</th><th>현재 base floorMax</th><th>시뮬레이션 base floorMax</th><th>변화율</th></tr></thead><tbody>${rows}</tbody>`;
}

function renderDebugScatter(records, relation, baseMaxByButton) {
  const width = Math.max(760, debugScatterChart.clientWidth || 1000);
  const height = 430;
  const pad = { left: 58, right: 24, top: 22, bottom: 62 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const scoped = records.map((record) => {
    const floorLabel = getFloorLabel(record);
    const button = Number(record.button);
    const baseMax = Number(baseMaxByButton?.[String(button)]);
    const multiplier = Number.isFinite(baseMax) && baseMax > 0 ? TARGET_TOP50_MAX / baseMax : NaN;
    const currentLogPower = scoreToPoint(Number(record.score)) * difficultyConstantForFloor(floorLabel, button);
    const simulatedLogPower = scoreToPoint(Number(record.score)) * simulatedBaseDifficultyConstant(floorLabel, relation) * multiplier;
    return { ...record, floorLabel, currentLogPower, simulatedLogPower };
  }).filter((record) => floorLabels.includes(record.floorLabel) && Number.isFinite(record.simulatedLogPower));

  if (!scoped.length) {
    debugScatterChart.innerHTML = `<div class="empty">표시할 기록이 없습니다.</div>`;
    debugFloorMaxLegend.hidden = true;
    return;
  }

  const observedIndexes = scoped.map((record) => floorLabels.indexOf(record.floorLabel));
  const labels = floorLabels.slice(Math.min(...observedIndexes), Math.max(...observedIndexes) + 1);
  const values = scoped.map((record) => record.simulatedLogPower);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const span = Math.max(dataMax - dataMin, Math.abs(dataMax) * 0.01, 0.1);
  const padding = Math.max(span * 0.035, 0.02);
  const yRange = { min: Math.max(0, dataMin - padding), max: dataMax + padding };
  const xRange = { mode: "floor", labels, displayLabels: new Map(), axisTitle: "floorName (n.m)" };
  const xFor = (label, jitter = 0) => {
    const index = labels.indexOf(label);
    if (labels.length === 1) return pad.left + plotW / 2 + jitter * Math.min(48, plotW * 0.1);
    return pad.left + ((index + jitter) / Math.max(1, labels.length - 1)) * plotW;
  };
  const yFor = (value) => pad.top + (1 - (value - yRange.min) / (yRange.max - yRange.min)) * plotH;
  const metricRows = scoped.map((record) => ({ ...record, xLabel: record.floorLabel, metricValue: record.simulatedLogPower }));
  const top50Keys = buildTop50RecordKeys(scoped, (record) => record.simulatedLogPower);
  const grouped = groupMetricsByFloor(metricRows);
  const maxPoints = buildSeriesPoints(labels, grouped, xFor, yFor, "max");
  const averagePoints = buildSeriesPoints(labels, grouped, xFor, yFor, "avg");
  const minPoints = buildSeriesPoints(labels, grouped, xFor, yFor, "min");
  const selectedButton = buttonFilter.value ? Number(buttonFilter.value) : null;
  let floorMaxPoints = "";
  if (selectedButton) {
    const baseMax = Number(baseMaxByButton?.[String(selectedButton)]);
    const multiplier = Number.isFinite(baseMax) && baseMax > 0 ? TARGET_TOP50_MAX / baseMax : NaN;
    const maxByFloor = new Map(labels.map((label) => [label, 10 * simulatedBaseDifficultyConstant(label, relation) * multiplier]));
    floorMaxPoints = buildFloorMaxSeriesPoints(labels, maxByFloor, xFor, yFor);
  }
  debugFloorMaxLegend.hidden = !floorMaxPoints;
  const grid = buildGrid(xRange, yRange, pad, plotW, plotH, xFor, yFor);
  const dots = metricRows.map((record) => {
    const jitter = stableJitter(`${record.button}-${record.name}-${record.pattern}-${record.level}`) * 0.42;
    const isTop50 = top50Keys.has(recordKey(record));
    const info = encodeURIComponent(JSON.stringify({
      name: record.name || "",
      button: record.button,
      pattern: record.pattern || "",
      level: record.level ?? "",
      floor: record.floorLabel,
      score: Number(record.score),
      currentLogPower: record.currentLogPower,
      simulatedLogPower: record.simulatedLogPower,
      maxCombo: record.maxCombo === true,
      top50: isTop50,
    }));
    const cx = clampChartDotX(xFor(record.floorLabel, jitter), pad.left, plotW).toFixed(2);
    return `<circle class="chartDot debugChartPoint${isTop50 ? " top50Dot" : ""}${record.maxCombo === true ? " comboDot" : ""}" cx="${cx}" cy="${yFor(record.simulatedLogPower).toFixed(2)}" r="${record.maxCombo === true ? 4.8 : 3.9}" data-info="${info}" tabindex="0"></circle>`;
  }).join("");

  debugScatterChart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="내 기록 LogPower 시뮬레이션 산포도">
      <defs><clipPath id="debugChartPlotClip"><rect x="${pad.left}" y="${pad.top}" width="${plotW}" height="${plotH}"></rect></clipPath></defs>
      <rect class="chartBg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${grid}
      <g clip-path="url(#debugChartPlotClip)">
        ${floorMaxPoints ? `<polyline class="floorMaxLine" points="${floorMaxPoints}"></polyline>` : ""}
        ${maxPoints ? `<polyline class="maxLine" points="${maxPoints}"></polyline>` : ""}
        ${averagePoints ? `<polyline class="avgLine" points="${averagePoints}"></polyline>` : ""}
        ${minPoints ? `<polyline class="minLine" points="${minPoints}"></polyline>` : ""}
        ${dots}
      </g>
      <text class="axisTitle" x="16" y="18">simulated LogPower</text>
      <text class="axisTitle" x="${width - 170}" y="${height - 16}">floorName (n.m)</text>
    </svg>`;
  debugScatterChart.querySelectorAll(".debugChartPoint").forEach((point) => {
    point.addEventListener("pointermove", (event) => showDebugChartTooltip(event, point.dataset.info));
    point.addEventListener("pointerenter", (event) => showDebugChartTooltip(event, point.dataset.info));
    point.addEventListener("focus", (event) => showDebugChartTooltip(event, point.dataset.info));
    point.addEventListener("pointerleave", hideDebugChartTooltip);
    point.addEventListener("blur", hideDebugChartTooltip);
  });
}

function showDebugChartTooltip(event, encodedInfo) {
  if (!encodedInfo) return;
  const info = JSON.parse(decodeURIComponent(encodedInfo));
  debugChartTooltip.innerHTML = `
    <strong>${escapeHtml(info.name)}</strong>
    <span>${escapeHtml(info.button)}B · ${escapeHtml(info.pattern)} · Lv.${escapeHtml(info.level)} · floor ${escapeHtml(info.floor)}</span>
    <span>score ${escapeHtml(formatChartMetric(info.score, "score"))}${info.maxCombo ? " · MAX COMBO" : ""}</span>
    <span>현재 ${escapeHtml(formatChartMetric(info.currentLogPower, "logPower"))} · 시뮬레이션 ${escapeHtml(formatChartMetric(info.simulatedLogPower, "logPower"))}${info.top50 ? " · TOP50" : ""}</span>`;
  debugChartTooltip.hidden = false;
  const x = (event.clientX || window.innerWidth / 2) + 14;
  const y = (event.clientY || window.innerHeight / 2) + 14;
  debugChartTooltip.style.left = `${Math.max(12, Math.min(x, window.innerWidth - debugChartTooltip.offsetWidth - 12))}px`;
  debugChartTooltip.style.top = `${Math.max(12, Math.min(y, window.innerHeight - debugChartTooltip.offsetHeight - 12))}px`;
}

function hideDebugChartTooltip() {
  debugChartTooltip.hidden = true;
}

function formatSigned(value, digits = 2) {
  if (!Number.isFinite(Number(value))) return "-";
  const number = Number(value);
  return `${number > 0 ? "+" : ""}${number.toFixed(digits)}`;
}

function filterRows(rows) {
  const button = buttonFilter.value;
  const pattern = patternFilter.value;
  const query = searchInput.value.trim().toLowerCase();
  return rows.filter((row) => {
    if (button && String(row.button) !== button) return false;
    if (pattern && String(row.pattern || "") !== pattern) return false;
    if (viewSelect.value === "records" && !isFloorInRecordsRange(row.floorName)) return false;
    if (viewSelect.value === "compare") {
      const mode = compareModeSelect.value;
      const minZ = Number(compareMinZSelect.value) || 0;
      if (!isFloorInCompareRange(row.floorName)) return false;
      if (minZ > 0 && (!Number.isFinite(row.absZDiff) || row.absZDiff < minZ)) return false;
      if (mode === "scoreMine" && !(row.scoreDiff > 0)) return false;
      if (mode === "scoreOther" && !(row.scoreDiff < 0)) return false;
      if (mode === "zMine" && !(row.zDiff > 0)) return false;
      if (mode === "zOther" && !(row.zDiff < 0)) return false;
      if (mode === "logPowerMine" && !(row.logPowerDiff > 0)) return false;
      if (mode === "logPowerOther" && !(row.logPowerDiff < 0)) return false;
      if (mode === "pointMine" && !(row.pointDiff > 0)) return false;
      if (mode === "pointOther" && !(row.pointDiff < 0)) return false;
      if (mode === "reversal" && !row.isReversal) return false;
    }
    if (!query) return true;
    return JSON.stringify(row).toLowerCase().includes(query);
  });
}

function isFloorInRecordsRange(floorLabel) {
  const rowFloorIndex = floorLabels.indexOf(String(floorLabel || ""));
  let start = floorLabels.indexOf(recordsFloorMinSelect.value);
  let end = floorLabels.indexOf(recordsFloorMaxSelect.value);
  if (rowFloorIndex < 0 || start < 0 || end < 0) return false;
  if (start > end) [start, end] = [end, start];
  return rowFloorIndex >= start && rowFloorIndex <= end;
}

function isFloorInCompareRange(floorLabel) {
  const floorIndex = floorLabels.indexOf(floorLabel);
  let start = floorLabels.indexOf(compareFloorMinSelect.value);
  let end = floorLabels.indexOf(compareFloorMaxSelect.value);
  if (floorIndex < 0 || start < 0 || end < 0) return true;
  if (start > end) [start, end] = [end, start];
  return floorIndex >= start && floorIndex <= end;
}

function sortRows(rows) {
  if (viewSelect.value === "compare" && !state.sortKey) {
    const sort = compareSortSelect.value || "absZDiff";
    const key = sort.replace(/Asc|Desc$/, "");
    const dir = sort.endsWith("Asc") ? 1 : -1;
    rows.sort((a, b) => compareForSort(a[key], b[key]) * dir || compare(a.button, b.button) || compare(a.floor, b.floor) || compare(a.name, b.name));
    return;
  }
  if (viewSelect.value === "history" && !state.sortKey) {
    rows.sort((a, b) => compareForSort(b.updatedAt, a.updatedAt));
    return;
  }
  if (viewSelect.value === "selfCompare" && !state.sortKey) {
    rows.sort((a, b) => compareForSort(b.logPowerDiff, a.logPowerDiff) || compare(a.button, b.button) || compare(a.name, b.name));
    return;
  }
  if (!state.sortKey) return;
  const key = state.sortKey;
  const dir = state.sortDir === "asc" ? 1 : -1;
  rows.sort((a, b) => compareForSort(a[key], b[key]) * dir);
}

function toggleSort(key) {
  if (state.sortKey === key) state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
  else {
    state.sortKey = key;
    state.sortDir = "asc";
  }
  renderTable();
}

function renderCell(row, key) {
  const value = row[key];
  const classes = [];
  if (key === "name") classes.push("nameCell");
  if (key === "name" && isRecentRecord(row.updatedAt)) classes.push("recentName");
  if (["button", "rank", "floor", "score", "previousScore", "currentScore", "mineScore", "otherScore", "scoreDiff", "mineZ", "otherZ", "zDiff", "previousLogPower", "currentLogPower", "mineLogPower", "otherLogPower", "logPowerDiff", "minePoint", "otherPoint", "pointDiff", "scorePoint", "difficultyConstant", "floorMaxPoint", "logPower", "rating", "maxRating", "djpower", "maxDjpower", "top50sum", "tierPoint", "nextRating", "djPowerSum", "djPowerConversion", "maxDjPower"].includes(key)) classes.push("num");
  if (key === "pattern") classes.push("pattern");
  if (key === "level") classes.push("level");
  if (key === "score" && row.maxCombo === true) classes.push("comboScore");
  if (["scoreDiff", "zDiff", "logPowerDiff", "pointDiff"].includes(key) && Number(value) > 0) classes.push("positiveDiff");
  if (["scoreDiff", "zDiff", "logPowerDiff", "pointDiff"].includes(key) && Number(value) < 0) classes.push("negativeDiff");
  if (key === "result" && row.isReversal) classes.push("reversalCell");
  if (key === "mineScore" && row.mineMaxCombo === true) classes.push("comboScore");
  if (key === "otherScore" && row.otherMaxCombo === true) classes.push("comboScore");
  if (key === "previousScore" && row.previousMaxCombo === true) classes.push("comboScore");
  if (key === "currentScore" && row.currentMaxCombo === true) classes.push("comboScore");
  return `<td class="${classes.join(" ")}">${escapeHtml(formatValue(value, key))}</td>`;
}

function compare(a, b) {
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return String(a ?? "").localeCompare(String(b ?? ""), "ko");
}

function compareForSort(a, b) {
  const aMissing = a === null || a === undefined || a === "";
  const bMissing = b === null || b === undefined || b === "";
  if (aMissing && bMissing) return 0;
  if (aMissing) return -1;
  if (bMissing) return 1;
  return compare(a, b);
}

function floorIndex(label) {
  const normalized = String(label || "").trim();
  const index = floorLabels.indexOf(normalized);
  if (index >= 0) return index;
  const match = normalized.match(/^(\d{1,2})\.([1-3])$/);
  if (!match) return -1;
  const n = Number(match[1]);
  const m = Number(match[2]);
  if (n < 1 || n > 17) return -1;
  return (n - 1) * 3 + (m - 1);
}

function clampInt(value, min, max) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
}

function formatValue(value, key = "") {
  if (value === null || value === undefined) return "";
  if (["previousScore", "currentScore", "mineScore", "otherScore", "scoreDiff"].includes(key) && Number.isFinite(Number(value))) return Number(value).toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  if (["mineZ", "otherZ", "zDiff", "absZDiff"].includes(key) && Number.isFinite(Number(value))) return Number(value).toFixed(2);
  if (["previousLogPower", "currentLogPower", "mineLogPower", "otherLogPower", "logPowerDiff", "absLogPowerDiff", "minePoint", "otherPoint", "pointDiff", "absPointDiff"].includes(key) && Number.isFinite(Number(value))) return Number(value).toFixed(2);
  if (["scorePoint", "difficultyConstant", "floorMaxPoint", "logPower"].includes(key) && Number.isFinite(Number(value))) return Number(value).toFixed(2);
  if (["rating", "djpower"].includes(key) && Number.isFinite(Number(value))) return Number(value).toFixed(2);
  if (["updatedAt", "generatedAt", "previousUpdatedAt", "currentUpdatedAt"].includes(key)) return formatDate(value);
  return value;
}

function formatFloorStat(value) {
  if (value === null || value === undefined || value === "") return "-";
  return Number.isFinite(Number(value)) ? Number(value).toFixed(3).replace(/0+$/, "").replace(/\.$/, "") : "-";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function isRecentRecord(value) {
  if (!value) return false;
  const updatedAt = new Date(value);
  if (Number.isNaN(updatedAt.getTime())) return false;
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  return Date.now() - updatedAt.getTime() <= threeDays;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
