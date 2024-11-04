// Get references to form elements for the main form
const sectionName = document.getElementById('section-name');
const studentCount = document.getElementById('student-count');
const createBtn = document.getElementById('create-btn');

// Get references to error message elements for the main form
const sectionNameError = document.getElementById('section-name-error');
const studentCountError = document.getElementById('student-count-error');
const submitError = document.getElementById('submit-error');

// Add event listeners for real-time validation
sectionName.addEventListener('input', validateSectionName);
studentCount.addEventListener('input', validateStudentCount);
createBtn.addEventListener('click', validateForm);

/**
 * Validates the section name input
 * Ensures it contains only uppercase letters and numbers
 * Updates error message accordingly
 * Returns true if valid, false if invalid
 */
function validateSectionName() {
    const sectionNameValue = sectionName.value.trim();

    // Allow only uppercase letters and numbers
    if (!/^[A-Z0-9]+$/.test(sectionNameValue)) {
        sectionNameError.innerHTML = '<p>Section name Invalid</p>';
        return false;
    }

    sectionNameError.innerHTML = `<p class="valid">Section name valid</p>`;
    return true;
}

/**
 * Validates the student count input
 * Checks that it contains only numbers
 * Updates error message accordingly
 * Returns true if valid, false if invalid
 */
function validateStudentCount() {
    const studentCountValue = studentCount.value.trim();

    if (!/^\d+$/.test(studentCountValue)) {
        studentCountError.innerHTML = '<p>Student count must be a number</p>';
        return false;
    }

    studentCountError.innerHTML = `<p class="valid">Student count valid</p>`;
    return true;
}

/**
 * Validates the entire form before submission
 * Checks that all fields are valid
 * Shows error message if validation fails
 * Submits form if validation passes
 */
function validateForm(e) {
    e.preventDefault();

    // Reset submit error message
    submitError.innerHTML = '';
    submitError.style.display = 'none';

    const isSectionNameValid = validateSectionName();
    const isStudentCountValid = validateStudentCount();

    if (!isSectionNameValid || !isStudentCountValid) {
        submitError.innerHTML = '<p>Fill all the blanks correctly</p>';
        submitError.style.display = 'block';

        setTimeout(() => {
            submitError.style.display = 'none';
        }, 2000);
        return false;
    }

    // If validation passes, submit the form
    document.getElementById('create-section-form').submit();
}
