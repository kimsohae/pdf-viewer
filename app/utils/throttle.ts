export function throttle(cb, delay) {
    let timer;
    return (...args) => {
      if(timer) return;
      timer = setTimeout(()=>{
        cb(...args);
        timer = null;
      }, delay)
    }
  }