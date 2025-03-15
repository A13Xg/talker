const fileListElement = document.getElementById("file-list");
const categories = new Set();
const subCategories = new Set();
const subCategoryToCategory = {};
const CATEGORY_WITHOUT_MATCH = "CATEGORY_WITHOUT_MATCH";
fetch('manifest.json')
    .then(response => response.json())

    .then(items => {
        items.forEach(item => {
            categories.add(item.category);
            subCategories.add(item.subCategory);
            subCategoryToCategory[item.subCategory] = item.category;
            const image = item.image
            const regex = /images\/(.*).gif/
            const match = image.match(regex)
            const file = { name: image, download_url: image }
            if (match) {
                if (item.spokenName) {
                    file["spoken_name"] = item.spokenName
                } else {
                    file["spoken_name"] = match[1].replaceAll("_", " ")
                }
            }


            const listItem = document.createElement("li");
            fileListElement.appendChild(listItem);
            if (file.name.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
                const img = document.createElement("img");
                img.src = file.download_url;
                img.alt = file.spoken_name;
                img.classList.add("PECS", item.category || "category", item.subCategory || "subCategory");
                img.addEventListener("click", function () {
                    const utterance = new SpeechSynthesisUtterance(file.spoken_name)
                    window.speechSynthesis.speak(utterance);
                    img.style.transform = "scale(1)";
                    img.style.transition = "transform 0.25s ease";
                    setTimeout(function () {
                        img.style = {}
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
    .catch(error => console.error("Error fetching files:", error));

function addClearButton() {
    const categoryButton = document.createElement("button")
    categoryButton.addEventListener("click", () => {
        filterImagesByClass("PECS");
        filterSubCategoriesByClass(CATEGORY_WITHOUT_MATCH);
    })
    categoryButton.textContent = "clear"
    document.getElementById("search").appendChild(categoryButton)

}
function updateCategories() {
    console.log(categories)
    categories.forEach((category) => {
        if (!category) {
            return
        }
        const categoryButton = document.createElement("button")
        categoryButton.addEventListener("click", () => {
            filterImagesByClass(category);
            filterSubCategoriesByClass(category)
        })

        categoryButton.textContent = category.replaceAll("_", " ")
        document.getElementById("categories").appendChild(categoryButton)
    })
}
function updateSubCategories() {
    subCategories.forEach((subCategory) => {
        if (!subCategory) {
            return
        }
        const className = subCategoryToCategory[subCategory]
        const subCategoryButton = document.createElement("button")
        subCategoryButton.classList.add(className, "subCategoriesButton")
        subCategoryButton.addEventListener("click", () => filterImagesByClass(subCategory))
        subCategoryButton.textContent = subCategory.replaceAll("_", " ")
        document.getElementById("subCategories").appendChild(subCategoryButton)
    })
}

function updateSearch() {
    const searchtext = document.getElementById("search-bar").value.replaceAll("'", "").toLowerCase()
    for (let element of document.getElementsByClassName("PECS")) {
        const altText = element.getAttribute("alt").toLowerCase()
        if (altText && searchtext && !altText.includes(searchtext)) {
            element.style.visibility = "hidden"
            element.style.display = "none"
            element.parentElement.style.visibility = "hidden"
            element.parentElement.style.display = "none"
        }
        else {
            element.style = null
            element.parentElement.style = null
        }
    }

}

function filterImagesByClass(category) {
    for (let element of document.getElementsByClassName("PECS")) {
        const hasCategory = element.classList.contains(category)
        if (!hasCategory) {
            element.style.visibility = "hidden"
            element.style.display = "none"
            element.parentElement.style.visibility = "hidden"
            element.parentElement.style.display = "none"
        }
        else {
            element.style = null
            element.parentElement.style = null
        }
    }

}

function filterSubCategoriesByClass(category) {
    for (let element of document.getElementsByClassName("subCategoriesButton")) {
        const hasCategory = element.classList.contains(category)

        if (!hasCategory) {
            element.style.visibility = "hidden"
            element.style.display = "none"

        }
        else {
            element.style = null

        }
    }

}
document.getElementById("search-button").addEventListener("click", updateSearch)
document.getElementById("search-bar").addEventListener('keypress', function (event) {
    if (event.keyCode === 13) {
        updateSearch()
    }
});