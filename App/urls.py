from django.urls import path
from . import views
from django.views.decorators.cache import cache_page
from django.urls import path
from django.contrib.auth import views as auth_views
from .views import update_timer_status  # Import the view
from .views import current_time # time zone in philippines
from .views import student_submission
from .views import get_timer_status
from .views import set_timeline
from .views import get_teacher_sections

urlpatterns = [
    path('', views.student_submission, name='student_submission'),
    path('student_submission/', views.student_submission, name='student_submission'),
    path('set_timeline/', set_timeline, name='set_timeline'),
    path('submission_success/', views.submission_success, name='submission_success'),
    path('api/search_teachers/', views.search_teachers, name='search_teachers'),
    path('api/teachers/', views.get_teachers, name='get_teachers'),
    path('api/teacher_sections/<int:teacher_id>/', views.get_teacher_sections, name='get_teacher_sections'),
    path('teacher/login/', views.TeacherLoginView.as_view(), name='teacher_login'),
    path('teacher/dashboard/', views.teacher_dashboard, name='teacher_dashboard'),
    path('teacher/create-section/', views.create_section, name='create_section'),
    path('teacher/export_excel/', views.export_attendance_to_excel, name='export_excel'),
    path('teacher/set_timeline/', views.set_timeline, name='set_timeline'),
    path('api/update_profile/', views.update_teacher_profile, name='update_profile'),
    path('manage_teachers/', views.manage_teachers, name='manage_teachers'),
    path('delete_section/<int:section_id>/', views.delete_section, name='delete_section'),
    path('update_section/<int:section_id>/', views.update_section, name='update_section'),
    path('api/update_teacher_profile/', views.update_teacher_profile, name='update_teacher_profile'),
    path('teacher/profile/', views.teacher_profile, name='teacher_profile'),
    path('teacher/<int:teacher_id>/sections/', views.teacher_sections, name='teacher_sections'),
    path('create_section/', views.create_section, name='create_section'),
    path('section/<int:section_id>/attendance/', views.section_attendance, name='section_attendance'),
    path('section/<int:section_id>/export/', views.export_attendance_to_excel, name='export_attendance_to_excel'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('get_remaining_time/', views.get_remaining_time, name='get_remaining_time'),
    path('check_student_id/', views.check_student_id, name='check_student_id'),
    path('check_email/', views.check_email, name='check_email'),
    path('test/timeline/<int:section_id>/', views.test_timeline_view, name='test_timeline'),
    path('check_timeline_status/', views.check_timeline_status, name='check_timeline_status'),
    path('api/section-students/<int:section_id>/', views.get_section_students, name='attendanceTable'),
    path('api/teacher-sections/<int:teacher_id>/', views.get_teacher_sections, name='get_teacher_sections'),
    path('section/<int:section_id>/capacity/', views.check_section_capacity, name='check_section_capacity'),
    path('section/<int:section_id>/reset/', views.reset_section_attendance, name='reset_section_attendance'),
    path('api/current_date/', views.get_current_date, name='get_current_date'),
    path('update_timer_status/', update_timer_status, name='update_timer_status'),
    path('api/current_time/', current_time, name='current_time'),
    path('submit_student/', student_submission, name='submit_student'),
    path('update_timer_status/', update_timer_status, name='update_timer_status'),
    path('get_timer_status/', get_timer_status, name='get_timer_status')
    
]
