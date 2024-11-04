document.addEventListener('DOMContentLoaded', function() {
    const tableContainer = document.querySelector('.table-section');
    if (!tableContainer) {
        console.error('Error: .table-section element not found.');
        return;
    }

    const datePlaceholder = document.getElementById('current-date');
    if (!datePlaceholder) {
        console.error('Error: #current-date element not found.');
        return;
    }

    // Fetch the current date from the server
    fetch('/api/current_date/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            datePlaceholder.textContent = `Date: ${data.current_date}`;
            datePlaceholder.classList.add('styled-date');
        })
        .catch(error => {
            console.error('Error fetching current date:', error);
            datePlaceholder.textContent = 'Failed to load date';
        });

    const resetConfirmModal = document.getElementById('resetConfirmModal');
    const resetBtn = document.getElementById('reset-table');
    const confirmResetBtn = document.getElementById('confirm-reset');
    const cancelResetBtn = document.getElementById('cancel-reset');

    // Hide modal initially
    if (resetConfirmModal) {
        resetConfirmModal.style.display = 'none';
    }

    // Reset button click handler to open modal
    if (resetBtn) {
        resetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (resetConfirmModal) {
                resetConfirmModal.style.display = 'block';
            }
        });
    }

    // Confirm reset handler with async request to reset attendance data
    if (confirmResetBtn) {
        confirmResetBtn.addEventListener('click', async function() {
            try {
                const sectionId = tableContainer.querySelector('table').dataset.sectionId;
                const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

                if (!csrfToken) {
                    throw new Error('CSRF token not found');
                }

                const response = await fetch(`/section/${sectionId}/reset/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.success) {
                    alert('Attendance table has been reset successfully.');
                    window.location.reload();
                } else {
                    throw new Error(data.error || 'Failed to reset attendance');
                }
            } catch (error) {
                console.error('Reset error:', error);
                alert('Failed to reset attendance: ' + error.message);
            } finally {
                if (resetConfirmModal) {
                    resetConfirmModal.style.display = 'none';
                }
            }
        });
    }

    // Cancel reset action
    if (cancelResetBtn) {
        cancelResetBtn.addEventListener('click', function() {
            if (resetConfirmModal) {
                resetConfirmModal.style.display = 'none'; // Hide modal when canceling
            }
        });
    }

    // Section name click handler
    const sectionsContainer = document.getElementById('sectionsContainer'); // Ensure this element exists
    if (sectionsContainer) {
        sectionsContainer.addEventListener('click', function(e) {
            const sectionNameElement = e.target.closest('.section-name');
            if (sectionNameElement) {
                const sectionId = sectionNameElement.dataset.sectionId;
                // Redirect to the attendance page
                window.location.href = `/section/${sectionId}/attendance/`;
            }
        });
    }

    // Instructions close button
    const instructionsCloseBtn = document.querySelector('.instructions .close-btn');
    if (instructionsCloseBtn) {
        instructionsCloseBtn.addEventListener('click', function() {
            document.getElementById('instructions-section').style.display = 'none';
        });
    }

    

    // Get scroll buttons
    const scrollToTopBtn = document.getElementById('scrollToTop');
    const scrollToBottomBtn = document.getElementById('scrollToBottom');

    // Show/hide scroll buttons based on scroll position
    window.addEventListener('scroll', function() {
        // Show "Scroll to Top" button only if scrolled down
        if (window.scrollY > 100) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
        
        // Show "Scroll to Bottom" button only if not at the bottom
        if (window.innerHeight + window.scrollY < document.body.offsetHeight - 100) {
            scrollToBottomBtn.style.display = 'block';
        } else {
            scrollToBottomBtn.style.display = 'none';
        }
    });

    // Scroll to top function
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Scroll to bottom function
    if (scrollToBottomBtn) {
        scrollToBottomBtn.addEventListener('click', function() {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
    }


    
});



// Function to fetch the current time from the API
// Function to fetch the current time from the API
function fetchCurrentTime() {
    fetch(`/api/current_time/?_=${new Date().getTime()}`) // Add a timestamp to prevent caching
        .then(response => response.json())
        .then(data => {
            console.log('Fetched current time:', data.current_time);
            updateAttendanceTable(data.current_time);
        })
        .catch(error => {
            console.error('Error fetching current time:', error);
        });
}

// Function to update the attendance table
function updateAttendanceTable(currentTime) {
    const attendanceTable = document.getElementById('attendance-table');
    
    // Loop through each row in the attendance table
    for (let row of attendanceTable.rows) {
        const timeCell = row.cells[row.cells.length - 1]; // Adjust index as needed
        timeCell.textContent = currentTime; // Update the cell with the current time
    }
}


// Call the fetchCurrentTime function when the page loads
document.addEventListener('DOMContentLoaded', fetchCurrentTime);

setInterval(fetchCurrentTime, 300000);