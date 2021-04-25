// https://www.freecodecamp.org/news/javascript-debounce-example/
export function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      // eslint-disable-next-line no-invalid-this
      func.apply(this, args);
    }, timeout);
  };
}

export const isSmallScreen = () => window.innerWidth < 1024;
