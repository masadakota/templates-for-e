function generateUniqueId() {
    return 'id-' + Math.random().toString(36).substr(2, 16);
}

function validateInput(input) {
    return typeof input === 'string' && input.trim() !== '';
}

export { generateUniqueId, validateInput };