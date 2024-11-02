from django.test import TestCase, Client
from django.utils import timezone
from App.models import Timeline, Section, Teacher, Student
from datetime import timedelta

class TimelineTestCase(TestCase):
    def setUp(self):
        # Create test teacher
        self.teacher = Teacher.objects.create_user(
            email='test@teacher.com',
            password='testpass123',
            teacher_id='TEST001'
        )
        
        # Create test section
        self.section = Section.objects.create(
            section_name='Test Section',
            teacher=self.teacher
        )
        
        # Create test timeline
        self.timeline = Timeline.objects.create(
            section=self.section,
            teacher=self.teacher,
            duration=5,  # 5 minutes
            is_active=True
        )

    def test_timeline_activation(self):
        """Test timeline activation and status checking"""
        self.assertTrue(self.timeline.is_active)
        self.assertTrue(self.timeline.is_timeline_active())
        
        # Test remaining time
        remaining_time = self.timeline.get_remaining_time()
        self.assertTrue(remaining_time > 0)
        
        # Test submission during active timeline
        response = self.client.post('/student_submission/', {
            'student_id': 'TEST001',
            'email': 'test@student.com',
            'section': self.section.id,
            'teacher': self.teacher.id
        })
        self.assertEqual(response.status_code, 200)
        
        # Test expired timeline
        self.timeline.start_time = timezone.now() - timedelta(minutes=6)
        self.timeline.save()
        self.assertFalse(self.timeline.is_timeline_active()) 