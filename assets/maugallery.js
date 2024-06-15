class MauGallery {
  constructor(element, options) {
    this.element = element;
    this.options = Object.assign({}, MauGallery.defaults, options);
    this.tagsCollection = [];
    this.init();
  }

  static defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true,
  };

  init() {
    this.createRowWrapper(this.element);
    if (this.options.lightBox) {
      this.createLightBox(
        this.element,
        this.options.lightboxId,
        this.options.navigation
      );
    }
    this.addListeners(this.options);

    Array.from(this.element.children).forEach((item) => {
      if (item.classList.contains("gallery-item")) {
        this.responsiveImageItem(item);
        this.moveItemInRowWrapper(item);
        this.wrapItemInColumn(item, this.options.columns);
        const theTag = item.getAttribute("data-gallery-tag");
        if (
          this.options.showTags &&
          theTag &&
          !this.tagsCollection.includes(theTag)
        ) {
          this.tagsCollection.push(theTag);
        }
      }
    });

    if (this.options.showTags) {
      this.showItemTags(
        this.element,
        this.options.tagsPosition,
        this.tagsCollection
      );
    }

    this.element.style.display = "block";
    this.element.style.opacity = 0;
    setTimeout(() => {
      this.element.style.transition = "opacity 0.5s";
      this.element.style.opacity = 1;
    }, 0);
  }

  createRowWrapper(element) {
    if (!element.querySelector(".row")) {
      const rowWrapper = document.createElement("div");
      rowWrapper.classList.add("gallery-items-row", "row");
      element.appendChild(rowWrapper);
    }
  }

  wrapItemInColumn(element, columns) {
    const itemColumn = document.createElement("div");
    itemColumn.classList.add("item-column", "mb-4");

    if (typeof columns === "number") {
      itemColumn.classList.add(`col-${Math.ceil(12 / columns)}`);
    } else if (typeof columns === "object") {
      if (columns.xs)
        itemColumn.classList.add(`col-${Math.ceil(12 / columns.xs)}`);
      if (columns.sm)
        itemColumn.classList.add(`col-sm-${Math.ceil(12 / columns.sm)}`);
      if (columns.md)
        itemColumn.classList.add(`col-md-${Math.ceil(12 / columns.md)}`);
      if (columns.lg)
        itemColumn.classList.add(`col-lg-${Math.ceil(12 / columns.lg)}`);
      if (columns.xl)
        itemColumn.classList.add(`col-xl-${Math.ceil(12 / columns.xl)}`);
    } else {
      console.error(
        `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
      );
    }

    element.parentNode.insertBefore(itemColumn, element);
    itemColumn.appendChild(element);
  }

  moveItemInRowWrapper(element) {
    const rowWrapper = this.element.querySelector(".gallery-items-row");
    if (rowWrapper) {
      rowWrapper.appendChild(element);
    }
  }

  responsiveImageItem(element) {
    if (element.tagName === "IMG") {
      element.classList.add("img-fluid");
    }
  }

  createLightBox(gallery, lightboxId, navigation) {
    const modal = document.createElement("div");
    modal.classList.add("modal", "fade");
    modal.id = lightboxId || "galleryLightbox";
    modal.tabIndex = -1;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-hidden", "true");

    const modalDialog = document.createElement("div");
    modalDialog.classList.add("modal-dialog");
    modalDialog.setAttribute("role", "document");

    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");

    const modalBody = document.createElement("div");
    modalBody.classList.add("modal-body");

    const prevButton = navigation
      ? `<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;">&lt;</div>`
      : `<span style="display:none;" />`;
    const nextButton = navigation
      ? `<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">&gt;</div>`
      : `<span style="display:none;" />`;

    modalBody.innerHTML = `${prevButton}<img class="lightboxImage img-fluid" alt="Image in modal"/>${nextButton}`;

    modalContent.appendChild(modalBody);
    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);
    gallery.appendChild(modal);
  }

  addListeners(options) {
    document.querySelectorAll(".gallery-item").forEach((item) => {
      item.addEventListener("click", () => {
        if (options.lightBox && item.tagName === "IMG") {
          this.openLightBox(item, options.lightboxId);
        }
      });
    });

    // Correctly attach event listeners to nav-links after they are added to the DOM
    this.element.addEventListener("click", (event) => {
      if (event.target.classList.contains("nav-link")) {
        this.filterByTag(event);
      }
    });

    document.querySelector(".gallery").addEventListener("click", (event) => {
      if (event.target.classList.contains("mg-prev")) {
        this.prevImage(options.lightboxId);
      } else if (event.target.classList.contains("mg-next")) {
        this.nextImage(options.lightboxId);
      }
    });
  }

  openLightBox(element, lightboxId) {
    const lightbox = document.getElementById(lightboxId || "galleryLightbox");
    if (lightbox) {
      const lightboxImage = lightbox.querySelector(".lightboxImage");
      lightboxImage.src = element.src;
      const modal = new bootstrap.Modal(lightbox);
      modal.show();
    }
  }

  prevImage(lightboxId) {
    const lightboxImage = document.querySelector(
      `#${lightboxId} .lightboxImage`
    );
    const images = Array.from(document.querySelectorAll("img.gallery-item"));
    const currentIndex = images.findIndex(
      (img) => img.src === lightboxImage.src
    );
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    lightboxImage.src = images[prevIndex].src;
  }

  nextImage(lightboxId) {
    const lightboxImage = document.querySelector(
      `#${lightboxId} .lightboxImage`
    );
    const images = Array.from(document.querySelectorAll("img.gallery-item"));
    const currentIndex = images.findIndex(
      (img) => img.src === lightboxImage.src
    );
    const nextIndex = (currentIndex + 1) % images.length;
    lightboxImage.src = images[nextIndex].src;
  }

  showItemTags(gallery, position, tags) {
    const tagItems = tags
      .map(
        (tag) =>
          `<li class="nav-item"><span class="nav-link" data-images-toggle="${tag}">${tag}</span></li>`
      )
      .join("");
    const tagsRow = `<ul class="my-4 tags-bar nav nav-pills"><li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>${tagItems}</ul>`;

    if (position === "bottom") {
      gallery.insertAdjacentHTML("beforeend", tagsRow);
    } else if (position === "top") {
      gallery.insertAdjacentHTML("afterbegin", tagsRow);
    } else {
      console.error(`Unknown tags position: ${position}`);
    }
  }

  filterByTag(event) {
    const activeTag = document.querySelector(".active-tag");
    if (activeTag) {
      activeTag.classList.remove("active", "active-tag");
    }
    event.target.classList.add("active", "active-tag");

    const tag = event.target.getAttribute("data-images-toggle");
    document.querySelectorAll(".gallery-item").forEach((item) => {
      const parentColumn = item.closest(".item-column");
      if (tag === "all" || item.getAttribute("data-gallery-tag") === tag) {
        parentColumn.style.display = "block";
      } else {
        parentColumn.style.display = "none";
      }
    });
  }
}
