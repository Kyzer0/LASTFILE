// Main script initialization message


console.log("Teacher dashboard script loaded");


// Initialize sidebar functionality and state management when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    const sideBar = document.getElementById('side-bar');
    const backIcon = document.getElementById('back-icon');
    const arrow = document.getElementById('arrow');

    // Restore sidebar state from localStorage
    const sidebarState = localStorage.getItem('sidebarState');
    if (sidebarState === 'hidden') {
        sideBar.classList.add('hide');
        arrow.classList.remove('bx-left-arrow-alt');
        arrow.classList.add('bx-right-arrow-alt');
    }

    // Toggle sidebar visibility and save state
    backIcon.addEventListener('click', () => {
        if (arrow.classList.contains('bx-left-arrow-alt')) {
            sideBar.classList.add('hide');
            arrow.classList.remove('bx-left-arrow-alt');
            arrow.classList.add('bx-right-arrow-alt');
            localStorage.setItem('sidebarState', 'hidden');
        } else {
            sideBar.classList.remove('hide');
            arrow.classList.remove('bx-right-arrow-alt');
            arrow.classList.add('bx-left-arrow-alt');
            localStorage.setItem('sidebarState', 'visible');
        }
    });

    // Get references to sidebar navigation elements
    const teacherProfile = document.getElementById('teacher-profile');
    const dashboard = document.getElementById('dashboard');
    const setTimeline = document.getElementById('set-timeline');
    const createSection = document.getElementById('create-section');
    const manageSection = document.getElementById('manage-section');

    // Get references to content board elements
    const boardTeacherProfile = document.getElementById('update-profile');
    const boardDashboard = document.getElementById('board-dashboard');
    const boardSetTimeline = document.getElementById('board-set-timeline');
    const boardCreateSection = document.getElementById('board-create-section');
    const boardManageSection = document.getElementById('board-set-manage-section');

    // Hide all content boards
    function hideAllBoards() {
        boardTeacherProfile.style.display = 'none';
        boardDashboard.style.display = 'none';
        boardCreateSection.style.display = 'none';
        boardSetTimeline.style.display = 'none';
        boardManageSection.style.display = 'none';
    }

    // Show specific content board
    function showBoard(board) {
        hideAllBoards();
        board.style.display = 'block';
    }

    // Handle sidebar navigation using event delegation
    document.querySelector('.links').addEventListener('click', function(e) {
        const target = e.target.closest('a');
        if (!target) return;

        e.preventDefault();

        switch(target.id) {
            case 'teacher-profile':
                showBoard(boardTeacherProfile);
                break;
            case 'dashboard':
                window.location.href = '/teacher/dashboard/'; // Refresh the page
                break;
            case 'set-timeline':
                showBoard(boardSetTimeline);
                break;
            case 'create-section':
                showBoard(boardCreateSection);
                break;
            case 'manage-section':
                showBoard(boardManageSection);
                break;
        }
    });

    // Show dashboard by default
    showBoard(boardDashboard);

   
    // Initialize teacher profile update functionality
    document.addEventListener('DOMContentLoaded', function() {
        const updateProfileForm = document.getElementById('update-profile-form');
        const submitProfileBtn = document.getElementById('submit-profile-btn');
        const updateTeacherBtn = document.getElementById('update-teacher-btn');
        const deleteTeacherBtn = document.getElementById('delete-teacher-btn');
    
        // Handle profile updates and deletion
        function updateProfile(action) {
            const formData = new FormData(updateProfileForm);
            formData.append('action', action);
            
            const csrftoken = getCookie('csrftoken');
        
            fetch('/api/update_teacher_profile/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': csrftoken
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    if (action === 'delete') {
                        window.location.href = '/teacher/login/';
                    } else {
                        document.getElementById('first-name').value = data.first_name;
                        document.getElementById('last-name').value = data.last_name;
                        document.getElementById('display-name').value = data.display_name;
                    }
                } else {
                    alert('Error: ' + data.error);
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert('An error occurred. Please try again.');
            });
        }
    });

    // Initialize section creation functionality
    document.addEventListener('DOMContentLoaded', function() {
        const createSectionForm = document.getElementById('create-section-form');
        const createBtn = document.getElementById('create-btn');
    
        if (!createSectionForm || !createBtn) {
            console.error('Create Section form or button not found');
            return;
        }
    
        // Handle section creation form submission
        createSectionForm.addEventListener('submit', function(e) {
            e.preventDefault();
    
            const formData = new FormData(this);
            console.log('Form data:', Object.fromEntries(formData.entries()));
    
            fetch(createSectionForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    window.location.href = '/teacher/dashboard/';
                } else {
                    alert('Error: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            });
        });
    });

    // Handle profile updates
    function updateProfile(action) {
        const fullName = document.getElementById('full-name').value;
        const displayName = document.getElementById('display-name').value;
        
        const data = {
            action: action,
            full_name: fullName,
            display_name: displayName
        };
    
        fetch('/api/update_teacher_profile/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                if (action === 'delete') {
                    window.location.href = '/teacher/login/';
                } else {
                    document.getElementById('full-name').value = data.full_name;
                    document.getElementById('display-name').value = data.display_name;
                }
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert('An error occurred. Please try again.');
        });
    }
    
    // Add event listeners for profile actions
    document.getElementById('submit-profile-btn').addEventListener('click', () => updateProfile('submit'));
    document.getElementById('update-teacher-btn').addEventListener('click', () => updateProfile('update'));
    document.getElementById('delete-teacher-btn').addEventListener('click', () => updateProfile('delete'));

    // Initialize section management functionality
    const manageSectionContainer = document.getElementById('board-set-manage-section');
    const sectionTableView = document.getElementById('section-table-view');
    const backToSectionsBtn = document.getElementById('back-to-sections');
    const sectionsListView = document.querySelector('.sections');

    // Handle section name clicks
    if (manageSectionContainer) {
        manageSectionContainer.addEventListener('click', function(e) {
            const sectionNameElement = e.target.closest('.section-name');
            if (sectionNameElement) {
                const sectionId = sectionNameElement.dataset.sectionId;
                const capacity = parseInt(sectionNameElement.dataset.capacity);
                const sectionName = sectionNameElement.textContent.trim();
                showSectionTable(sectionId, sectionName, capacity);
            }
        });
    }

    // Handle back button clicks
    if (backToSectionsBtn) {
        backToSectionsBtn.addEventListener('click', function() {
            sectionTableView.style.display = 'none';
            sectionsListView.style.display = 'block';
        });
    }

    // Add click handlers for sections
    const sections = document.querySelectorAll('.section-name');
    sections.forEach(section => {
        section.addEventListener('click', function() {
            const sectionId = this.dataset.sectionId;
            const sectionName = this.textContent.trim();
            window.location.href = `/section/${sectionId}/attendance/`;
        });
    });

    // Add update handlers for sections
    const updateButtons = document.querySelectorAll('.update-section');
    updateButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const sectionId = this.dataset.sectionId;
            const currentCapacity = this.dataset.capacity;
            updateSectionPrompt(sectionId, currentCapacity);
        });
    });

    // Add delete handlers for sections
    const deleteButtons = document.querySelectorAll('.delete-section');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const sectionId = this.dataset.sectionId;
            if (confirm('Are you sure you want to delete this section?')) {
                deleteSection(sectionId);
            }
        });
    });

    // Add CSS for clickable section names
    const style = document.createElement('style');
    style.textContent = `
        .section-name {
            cursor: pointer;
            padding: 10px;
            transition: background-color 0.3s;
        }
        .section-name:hover {
            background-color: #f0f0f0;
        }
    `;
    document.head.appendChild(style);
});

// Initialize teacher profile navigation
document.addEventListener('DOMContentLoaded', function() {
    const profileLink = document.getElementById('teacher-profile');
    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = "/teacher/profile/";
        });
    }
});

// Initialize section creation functionality
document.addEventListener('DOMContentLoaded', function() {
    const createSectionForm = document.getElementById('create-section-form');
    const createBtn = document.getElementById('create-btn');
    const sectionsContainer = document.getElementById('sections-container');

    if (!createSectionForm || !createBtn) {
        console.error('Create Section form or button not found');
        return;
    }

    // Handle create button clicks
    createBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Create Section button clicked');

        const formData = new FormData(createSectionForm);
        console.log('Form data:', Object.fromEntries(formData.entries()));

        const csrfToken = getCookie('csrftoken');
        console.log('CSRF Token:', csrfToken);

        // Handle form submission
        createSectionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
        
            fetch('/create_section/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    addSectionToList(data.section_id, formData.get('section_name'));
                    createSectionForm.reset();
                    refreshTimelineSections();
                } else {
                    alert('Error: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            });
        });
    });
});

// Get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Add new section to the list
function addSectionToList(sectionId, sectionName) {
    const newSection = document.createElement('div');
    newSection.className = 'section';
    newSection.innerHTML = `
        <p class="section-name" data-section-id="${sectionId}">${sectionName}</p>
        <div class="options">
            <button class="delete-section" data-section-id="${sectionId}">Delete</button>
            <button class="update-section" data-section-id="${sectionId}">Update</button>
        </div>
    `;
    sectionsContainer.appendChild(newSection);
}

// Refresh sections in timeline dropdown
function refreshTimelineSections() {
    const timelineSectionSelect = document.getElementById('section');
    fetch('/get_teacher_sections/')
        .then(response => response.json())
        .then(sections => {
            timelineSectionSelect.innerHTML = '';
            sections.forEach(section => {
                const option = document.createElement('option');
                option.value = section.id;
                option.textContent = section.section_name;
                timelineSectionSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error refreshing sections:', error));
}

// Initialize section table functionality
document.addEventListener('DOMContentLoaded', function() {
    // Section click handlers
    const sections = document.querySelectorAll('.section-name');
    sections.forEach(section => {
        section.addEventListener('click', function() {
            const sectionId = this.dataset.sectionId;
            const sectionName = this.textContent.trim();
            window.location.href = `/section/${sectionId}/attendance/`;
        });
    });

    // Update section handlers
    const updateButtons = document.querySelectorAll('.update-section');
    updateButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const sectionId = this.dataset.sectionId;
            const currentCapacity = this.dataset.capacity;
            updateSectionPrompt(sectionId, currentCapacity);
        });
    });

    // Delete section handlers
    const deleteButtons = document.querySelectorAll('.delete-section');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const sectionId = this.dataset.sectionId;
            if (confirm('Are you sure you want to delete this section?')) {
                deleteSection(sectionId);
            }
        });
    });

    // Add CSS for clickable section names
    const style = document.createElement('style');
    style.textContent = `
        .section-name {
            cursor: pointer;
            padding: 10px;
            transition: background-color 0.3s;
        }
        .section-name:hover {
            background-color: #f0f0f0;
        }
    `;
    document.head.appendChild(style);
});

// Handle section updates and deletions
const sectionsContainer = document.querySelector('.sections');
sectionsContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-section')) {
        e.stopPropagation();
        const sectionId = e.target.dataset.sectionId;
        if (confirm('Are you sure you want to delete this section?')) {
            deleteSection(sectionId);
        }
    }
    if (e.target.classList.contains('update-section')) {
        e.stopPropagation();
        const sectionId = e.target.dataset.sectionId;
        const currentCapacity = e.target.dataset.capacity;
        updateSectionPrompt(sectionId, currentCapacity);
    }
});

// Show update section prompt
function updateSectionPrompt(sectionId, currentCapacity) {
    const newName = prompt('Enter new section name:');
    const newCapacity = prompt('Enter new student capacity:', currentCapacity);
    
    if (newName && newCapacity) {
        updateSection(sectionId, newName, parseInt(newCapacity));
    }
}

// Update section details
function updateSection(sectionId, newName, newCapacity) {
    fetch(`/update_section/${sectionId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            section_name: newName,
            student_count: newCapacity
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const sectionElement = document.querySelector(`.section-name[data-section-id="${sectionId}"]`);
            sectionElement.textContent = newName;
            sectionElement.dataset.capacity = newCapacity;
            sectionElement.closest('.section').querySelector('.update-section').dataset.capacity = newCapacity;
            alert('Section updated successfully');
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

// Delete section
function deleteSection(sectionId) {
    fetch(`/delete_section/${sectionId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const sectionElement = document.querySelector(`.section[data-section-id="${sectionId}"]`);
            sectionElement.remove();
            alert('Section deleted successfully');
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

// Initialize navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.links a');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.id;
            switch(targetId) {
                case 'teacher-profile':
                    window.location.href = '/teacher/profile/';
                    break;
                case 'dashboard':
                    window.location.href = '/teacher/dashboard/';
                    break;
                case 'set-timeline':
                    showBoard(boardSetTimeline);
                    break;
                case 'create-section':
                    showBoard(boardCreateSection);
                    break;
                case 'manage-section':
                    showBoard(boardManageSection);
                    break;
                default:
                    break;
            }
        });
    });
});


//Summary of Timeline

// Summary of Timeline

// Timer functionality setup
const setTimelineForm = document.getElementById('set-timeline-form');
const timerDisplay = document.getElementById('display');
const timerStatus = document.getElementById('timer-status');
const teacherId = document.querySelector('input[name="teacher"]').value;
let timerInterval;
let remainingTime; // in seconds
let timerState = 'stopped'; // Possible states: 'running', 'stopped'

// Function to save timer state to local storage
function saveTimerState() {
    localStorage.setItem('timerState', JSON.stringify({
        remainingTime: remainingTime,
        isActive: timerState === 'running'
    }));
}

// Function to update the display
function updateDisplay() {
    if (remainingTime < 0) {
        remainingTime = 0; // Prevent negative time
    }
    const hours = String(Math.floor(remainingTime / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((remainingTime % 3600) / 60)).padStart(2, '0');
    const seconds = String(remainingTime % 60).padStart(2, '0');
    timerDisplay.textContent = `${hours}:${minutes}:${seconds}`;
}

// Function to start the timer
function startTimer(duration) {
    if (timerState === 'running') return; // Prevent starting if already running

    remainingTime = duration; // Set remaining time to the provided duration
    timerState = 'running'; // Update state

    const endTime = Date.now() + remainingTime * 1000; // Calculate end time

    // Update timer status in the backend
    updateTimerStatus(true) // Set is_active to true
        .then(() => {
            console.log('Timer status updated successfully in the backend.');
        })
        .catch(error => {
            console.error('Failed to update timer status in the backend:', error);
        });

    timerInterval = setInterval(() => {
        remainingTime = Math.max(0, Math.floor((endTime - Date.now()) / 1000)); // Update remaining time
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            timerDisplay.textContent = "00:00:00";
            timerStatus.textContent = "Timer finished!";
            timerState = 'stopped'; // Reset state
            updateTimerStatus(false); // Set is_active to false when finished
            resetButtons(); // Reset button visibility
            return;
        }
        updateDisplay();
    }, 1000);

    // Update button visibility
    document.getElementById('start-timer').style.display = 'none'; // Hide start button
    document.getElementById('stop-timer').style.display = 'inline-block'; // Show stop button
    document.getElementById('continue-timer').style.display = 'none'; // Hide continue button
}

// Function to stop the timer
function stopTimer() {
    if (timerState !== 'running') return; // Only stop if running

    clearInterval(timerInterval);
    timerState = 'stopped'; // Update state

    // Update timer status in the backend
    updateTimerStatus(false) // Set is_active to false
        .then(() => {
            console.log('Timer status updated successfully in the backend.');
        })
        .catch(error => {
            console.error('Failed to update timer status in the backend:', error);
        });

    // Update button visibility
    document.getElementById('start-timer').style.display = 'inline-block'; // Show start button
    document.getElementById('stop-timer').style.display = 'none'; // Hide stop button
    document.getElementById('continue-timer').style.display = 'inline-block'; // Show continue button
}

// Function to continue the timer
function continueTimer() {
    if (timerState === 'running') return; // Only continue if stopped

    // Calculate remaining time and start the timer again
    startTimer(remainingTime); // Resume timer with remaining time
}


// Function to reset button visibility when timer finishes
function resetButtons() {
    document.getElementById('start-timer').style.display = 'inline-block'; // Show start button
    document.getElementById('stop-timer').style.display = 'none'; // Hide stop button
    document.getElementById('continue-timer').style.display = 'none'; // Hide continue button
}

// Function to update the timer status in the backend
function updateTimerStatus(isActive) {
    const sectionId = document.getElementById('section').value; // Get the current section ID
    return fetch(`/update_timer_status/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        },
        body: JSON.stringify({
            section_id: sectionId,
            teacher_id: teacherId,
            is_active: isActive // Set isActive based on the function call
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Timer status updated successfully:', data);
        } else {
            console.error('Error updating timer status:', data.error);
            throw new Error(data.error); // Handle error
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while updating the timer status. Please try again.');
    });
}

// On page load, check for existing timer state
document.addEventListener('DOMContentLoaded', function() {
    const savedState = localStorage.getItem('timerState');
    if (savedState) {
        const state = JSON.parse(savedState);
        remainingTime = state.remainingTime;

        // Ensure remainingTime is a valid number
        if (typeof remainingTime !== 'number' || remainingTime < 0) {
            remainingTime = 0; // Reset to 0 if invalid
        }

        // Update the display with the remaining time
        updateDisplay();

        // Check if the timer was active or stopped
        if (state.isActive) {
            startTimer(remainingTime); // Resume timer if it was active
        } else {
            // If the timer was stopped, show the continue button
            document.getElementById('continue-timer').style.display = 'inline-block'; // Show continue button
            document.getElementById('start-timer').style.display = 'none'; // Hide start button
            document.getElementById('stop-timer').style.display = 'none'; // Hide stop button
        }
    } else {
        // Initialize the display to 00:00:00 if no saved state
        timerDisplay.textContent = "00:00:00";
    }
});

// Set up event listeners for buttons
document.getElementById('set-timeline-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
    const duration = parseInt(document.getElementById('duration').value) * 60; // Convert minutes to seconds
    startTimer(duration); // Start the timer
});

document.getElementById('stop-timer').addEventListener('click', stopTimer); // Call stopTimer when the stop button is clicked
document.getElementById('continue-timer').addEventListener('click', continueTimer); // Call continueTimer when the continue button is clicked

// Event listener for the Reset Timer button
document.getElementById('refresh-timer').addEventListener('click', () => {
    timerDisplay.textContent = "00:00:00"; // Reset display
    timerStatus.textContent = "Timer reset"; // Optional status update
    remainingTime = 0; // Reset remaining time
    localStorage.removeItem('timerState'); // Clear saved state
    resetButtons(); // Reset button visibility
    document.getElementById('duration').value = ''; // Clear the duration input field
});

// AJAX Polling Function
function pollTimerStatus() {
    fetch(`/get_timer_status/?teacher_id=${teacherId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update the timer state based on the response
                remainingTime = data.remaining_time; // Update remaining time
                timerState = data.is_active ? 'running' : 'stopped'; // Update timer state

                // Update the display
                updateDisplay();

                // Update button visibility based on the timer state
                if (timerState === 'running') {
                    document.getElementById('start-timer').style.display = 'none';
                    document.getElementById('stop-timer').style.display = 'inline-block';
                    document.getElementById('continue-timer').style.display = 'none';
                } else {
                    document.getElementById('start-timer').style.display = 'inline-block';
                    document.getElementById('stop-timer').style.display = 'none';
                    document.getElementById('continue-timer').style.display = 'inline-block';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching timer status:', error);
        });
}

// Start polling every 5 seconds
setInterval(pollTimerStatus, 5000);