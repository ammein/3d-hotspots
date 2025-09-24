let responseJSON = {};

/**
 * Fetch and load translations from a JSON file
 * @param {string} url - URL of the JSON file
 * @param {string} [lang='en'] - Language code to load translations for
 * @returns {Promise<void>} Promise that resolves when translations are loaded
 */
async function loadFromJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        responseJSON = await response.json();
        return responseJSON;
    } catch (error) {
        console.error('Error loading translations:', error);
        throw error;
    }
}

function getLanguage() {
    // First check URL parameter
    const url = new URL(window.location.href);
    const urlLang = url.searchParams.get('lang');
    if (urlLang) {
        return urlLang;
    }

    // Then check HTML lang attribute
    const htmlLang = document.documentElement.lang;

    // Return the first valid language found
    return htmlLang || 'en';
}

export {
    getLanguage,
    loadFromJSON
};
