import "@/scss/style.scss";
import "./common.js";
import "./home.js";
import "./tab.js";
import "./page.js";

// 메인 여부 체크
const isHome = document.body.dataset.page === 'home' // <body data-page="home">
if (isHome) {
  import('./home.js')
}
