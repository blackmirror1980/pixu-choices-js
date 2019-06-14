import { SCROLLING_SPEED } from '../constants';

export default class List {
  constructor({ element, classNames }) {
    Object.assign(this, {
      element,
      listElement: element.classList.contains(classNames.listScroller) ? element.querySelector(`.${classNames.list}`) : element,
    });

    this.scrollPos = this.element.scrollTop;
    this.height = this.element.offsetHeight;
    this.hasChildren = !!this.element.children;
  }

  clear() {
    this.listElement.innerHTML = '';
  }

  append(node) {
    this.listElement.appendChild(node);
  }

  getChild(selector) {
    return this.listElement.querySelector(selector);
  }

  getOverlayScrollbarsInstance() {
    const OverlayScrollbars = window.OverlayScrollbars;

    // eslint-disable-next-line no-extra-boolean-cast
    if(!!OverlayScrollbars) {
      return OverlayScrollbars(this.element) || null;
    }

    return null;
  }

  scrollToTop() {
    const scrollbars = this.getOverlayScrollbarsInstance();

    // eslint-disable-next-line no-extra-boolean-cast
    if(!!scrollbars) {
      scrollbars.scroll({y : 0});
    } else {
      this.element.scrollTop = 0;
    }
  }

  scrollToChoice(choice, direction) {
    if (!choice) {
      return;
    }

    const scrollbars = this.getOverlayScrollbarsInstance();

    // eslint-disable-next-line no-extra-boolean-cast
    if(!!scrollbars) {
      scrollbars.scroll({ el : choice, scroll : { y : 'ifneeded', x : 'never' } });
    } else {
      const dropdownHeight = this.listElement.offsetHeight;
      const choiceHeight = choice.offsetHeight;
      // Distance from bottom of element to top of parent
      const choicePos = choice.offsetTop + choiceHeight;
      // Scroll position of dropdown
      const containerScrollPos = this.listElement.scrollTop + dropdownHeight;
      // Difference between the choice and scroll position
      const endpoint =
        direction > 0
          ? this.listElement.scrollTop + choicePos - containerScrollPos
          : choice.offsetTop;

      requestAnimationFrame(time => {
        this._animateScroll(time, endpoint, direction);
      });
    }
  }

  _scrollDown(scrollPos, strength, endpoint) {
    const easing = (endpoint - scrollPos) / strength;
    const distance = easing > 1 ? easing : 1;

    this.listElement.scrollTop = scrollPos + distance;
  }

  _scrollUp(scrollPos, strength, endpoint) {
    const easing = (scrollPos - endpoint) / strength;
    const distance = easing > 1 ? easing : 1;

    this.listElement.scrollTop = scrollPos - distance;
  }

  _animateScroll(time, endpoint, direction) {
    const strength = SCROLLING_SPEED;
    const choiceListScrollTop = this.listElement.scrollTop;
    let continueAnimation = false;

    if (direction > 0) {
      this._scrollDown(choiceListScrollTop, strength, endpoint);

      if (choiceListScrollTop < endpoint) {
        continueAnimation = true;
      }
    } else {
      this._scrollUp(choiceListScrollTop, strength, endpoint);

      if (choiceListScrollTop > endpoint) {
        continueAnimation = true;
      }
    }

    if (continueAnimation) {
      requestAnimationFrame(() => {
        this._animateScroll(time, endpoint, direction);
      });
    }
  }
}
