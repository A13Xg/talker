import { SplashScreen } from "@capacitor/splash-screen";
import { Camera } from "@capacitor/camera";

window.customElements.define(
  "home-section",
  class extends HTMLElement {
    constructor() {
      super();

      SplashScreen.hide();

      const root = this.attachShadow({ mode: "open" });

      const html = String.raw;

      root.innerHTML = html`
        <style>
          ul li {
            display: inline-block;
            margin-right: 10px;
          }

          img {
            width: 150px;
            margin: 10px;
            transition: transform 0.2s ease-out;
          }

          img:hover {
            cursor: pointer;
            transform: scale(1.05);
          }

          ul {
            list-style-type: none;
            padding: 0;
          }

          li {
            margin: 5px 0;
          }

          /* General button styling */
          button {
            background-color: #040079;
            color: white;
            border: 2px solid white;
            padding: 10px 15px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.2s ease, transform 0.1s ease;
          }

          button.subCategoriesButton {
            background-color: #0902ce;
          }

          button:hover {
            background-color: #030058;
            transform: scale(1.05);
          }

          button.subCategoriesButton:hover {
            background-color: #0500a1;
          }

          button:active {
            transform: scale(0.98);
          }

          /* Search button specifically */
          #search {
            display: flex;
            gap: 5px;
            margin-bottom: 20px;
          }

          #search-bar {
            padding: 8px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 5px;
            flex-grow: 1;
          }

          #search-button {
            background-color: #007bff;
            /* Blue */
          }

          #search-button:hover {
            background-color: #0056b3;
          }
        </style>
        <main>
          <div>
            <home-section-titlebar> </home-section-titlebar>
            <div id="search">
              <input
                id="search-bar"
                type="search"
                placeholder="Search..."
                class="search"
              />
              <button id="search-button">🔍</button>
            </div>
            <div id="categories"></div>
            <div id="subCategories"></div>
            <ul id="file-list"></ul>
          </div>
        </main>
      `;
    }

    connectedCallback() {
      const self = this;

      const fileListElement = self.shadowRoot.querySelector("#file-list");
      const categories = new Set();
      const subCategories = new Set();
      const subCategoryToCategory = {};
      const CATEGORY_WITHOUT_MATCH = "CATEGORY_WITHOUT_MATCH";

      fetch("manifest.json")
        .then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson);
          return responseJson["images"];
        })
        .then((items) => {
          items.forEach((item) => {
            categories.add(item.category);
            subCategories.add(item.subCategory);
            subCategoryToCategory[item.subCategory] = item.category;
            const image = item.image;
            const regex = /images\/(.*).gif/;
            const match = image.match(regex);
            const file = { name: image, download_url: image };
            if (match) {
              if (item.spokenName) {
                file["spoken_name"] = item.spokenName;
              } else {
                file["spoken_name"] = match[1].replaceAll("_", " ");
              }
            }

            const listItem = document.createElement("li");
            fileListElement.appendChild(listItem);
            if (file.name.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
              const img = document.createElement("img");
              img.src = file.download_url;
              img.alt = file.spoken_name;
              img.classList.add(
                "PECS",
                item.category || "category",
                item.subCategory || "subCategory"
              );
              img.addEventListener("click", function () {
                const utterance = new SpeechSynthesisUtterance(
                  file.spoken_name
                );
                window.speechSynthesis.speak(utterance);
                img.style.transform = "scale(1)";
                img.style.transition = "transform 0.25s ease";
                setTimeout(function () {
                  img.style = {};
                }, 250);
              });
              listItem.appendChild(img);
            }
          });
        })
        .then(() => {
          addClearButton();
          updateCategories();
          updateSubCategories();
          filterSubCategoriesByClass(CATEGORY_WITHOUT_MATCH);
        })
        .catch((error) => console.error("Error fetching files:", error));

      function addClearButton() {
        const categoryButton = document.createElement("button");
        categoryButton.addEventListener("click", () => {
          filterImagesByClass("PECS");
          filterSubCategoriesByClass(CATEGORY_WITHOUT_MATCH);
        });
        categoryButton.textContent = "clear";
        self.shadowRoot.getElementById("search").appendChild(categoryButton);
      }
      function updateCategories() {
        // console.log(categories);
        categories.forEach((category) => {
          if (!category) {
            return;
          }
          const categoryButton = document.createElement("button");
          categoryButton.addEventListener("click", () => {
            filterImagesByClass(category);
            filterSubCategoriesByClass(category);
          });

          categoryButton.textContent = category.replaceAll("_", " ");
          self.shadowRoot
            .getElementById("categories")
            .appendChild(categoryButton);
        });
      }
      function updateSubCategories() {
        subCategories.forEach((subCategory) => {
          if (!subCategory) {
            return;
          }
          const className = subCategoryToCategory[subCategory];
          const subCategoryButton = document.createElement("button");
          subCategoryButton.classList.add(className, "subCategoriesButton");
          subCategoryButton.addEventListener("click", () =>
            filterImagesByClass(subCategory)
          );
          subCategoryButton.textContent = subCategory.replaceAll("_", " ");
          self.shadowRoot
            .getElementById("subCategories")
            .appendChild(subCategoryButton);
        });
      }

      function updateSearch() {
        const searchtext = self.shadowRoot
          .getElementById("search-bar")
          .value.replaceAll("'", "")
          .toLowerCase();
        for (let element of self.shadowRoot.querySelectorAll(".PECS")) {
          const altText = element.getAttribute("alt").toLowerCase();
          if (altText && searchtext && !altText.includes(searchtext)) {
            element.style.visibility = "hidden";
            element.style.display = "none";
            element.parentElement.style.visibility = "hidden";
            element.parentElement.style.display = "none";
          } else {
            element.style = null;
            element.parentElement.style = null;
          }
        }
      }

      function filterImagesByClass(category) {
        for (let element of self.shadowRoot.querySelectorAll(".PECS")) {
          const hasCategory = element.classList.contains(category);
          if (!hasCategory) {
            element.style.visibility = "hidden";
            element.style.display = "none";
            element.parentElement.style.visibility = "hidden";
            element.parentElement.style.display = "none";
          } else {
            element.style = null;
            element.parentElement.style = null;
          }
        }
      }

      function filterSubCategoriesByClass(category) {
        for (let element of self.shadowRoot.querySelectorAll(
          ".subCategoriesButton"
        )) {
          const hasCategory = element.classList.contains(category);

          if (!hasCategory) {
            element.style.visibility = "hidden";
            element.style.display = "none";
          } else {
            element.style = null;
          }
        }
      }
      self.shadowRoot
        .getElementById("search-button")
        .addEventListener("click", updateSearch);
      self.shadowRoot
        .getElementById("search-bar")
        .addEventListener("keypress", function (event) {
          if (event.key === 13) {
            updateSearch();
          }
        });
    }
  }
);

window.customElements.define(
  "home-section-titlebar",
  class extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `
    <style>
      :host {
        position: relative;
        display: block;
        padding: 15px 15px 15px 15px;
        text-align: center;
        background-color: #73B5F6;
      }
      ::slotted(h1) {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-size: 0.9em;
        font-weight: 600;
        color: #fff;
      }
    </style>
    <slot></slot>
    `;
    }
  }
);
