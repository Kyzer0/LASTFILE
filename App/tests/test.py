from django.test import TestCase
from django.utils import timezone
from django.contrib.auth.models import User
from App.models import Timeline, Section, Teacher, Student  # Import relevant models



# Test Script
def test_multiple_teachers_same_section():
    # Create test data
    section = Section.objects.create(name="Test Section")
    teacher1 = Teacher.objects.create(username="teacher1")
    teacher2 = Teacher.objects.create(username="teacher2")
    
    # Set timeline for teacher1
    Timeline.objects.create(
        section=section,
        teacher=teacher1,
        duration=10,
        is_active=True
    )
    
    # Set timeline for teacher2
    Timeline.objects.create(
        section=section,
        teacher=teacher2,
        duration=15,
        is_active=True
    )
    
    # Verify both timelines are active
    assert Timeline.objects.filter(section=section, is_active=True).count() == 2