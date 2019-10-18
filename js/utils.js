function getParameterByName(name = '', url = '') {
  if (!url) url = window.location.href;

  const urlObject = new URL(url);
  return urlObject.searchParams.get(name);
}

export default getParameterByName;
