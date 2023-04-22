function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const sourcesParam = getQueryParam("sources") || "";
const tagsParam = getQueryParam("tags") || "";
const characterIDParam = getQueryParam("characterID") || "";

// 处理 tags 参数，可能包含 0 个、1 个或多个值
const tagsArray = tagsParam ? tagsParam.split(",") : [];
const encodedTags = tagsArray.map((tag) => encodeURIComponent(tag)).join(",");

const apiUrl = `https://indexer.crossbell.io/v1/notes?limit=3&includeDeleted=false&sources=${encodeURIComponent(
  sourcesParam
)}&tags=${encodedTags}&characterID=${encodeURIComponent(
  characterIDParam
)}&includeEmptyMetadata=false&includeCharacter=false&includeHeadCharacter=false&includeHeadNote=false&includeNestedNotes=false`;

let nextPage = 1;
let isLoading = false;

// 其余代码保持不变

async function fetchFeedData(page) {
  try {
    const response = await fetch(apiUrl + "&page=" + page);

    if (!response.ok) {
      throw new Error("Failed to fetch feed data");
    }

    const data = await response.json();
    return data.list;
  } catch (error) {
    console.error("Error fetching feed data:", error);
    return [];
  }
}

function createFeedItem(itemData) {
  const feedItem = document.createElement("div");
  feedItem.className = "feed-item";
  const sourceText = itemData.metadata.content.sources
    .slice(1)
    .map((source) => {
      return source.replace(/discord server:|channel:/g, "").trim();
    })
    .join(" / ");
  feedItem.innerHTML = `
      <div class="feed-avatar">
          <img src="source_image.jpg" alt="avatar" />
          <p class="character-id">${itemData.characterId}</p>
      </div>
      <div class="feed-content">
          <h3 class="feed-title">${itemData.metadata.content.title}</h3>
          <p class="feed-text">${itemData.metadata.content.content}</p>
          <p class="feed-info">${new Date(
            itemData.metadata.content.date_published
          ).toLocaleString()}</p>
          <p class="feed-source">${sourceText}</p>
          <div class="feed-tags">
              ${itemData.metadata.content.tags
                .map((tag) => `<span>${tag}</span>`)
                .join("")}
          </div>
          <a href="#" class="feed-collect">收藏</a>
      </div>
  `;
  return feedItem;
}

async function displayFeedItems() {
  isLoading = true;
  const feedData = await fetchFeedData(nextPage);
  const feedContainer = document.getElementById("feed");

  for (const itemData of feedData) {
    const feedItem = createFeedItem(itemData);
    feedContainer.appendChild(feedItem);
  }

  nextPage += 1;
  isLoading = false;
}

document.addEventListener("DOMContentLoaded", () => {
  displayFeedItems();
});
