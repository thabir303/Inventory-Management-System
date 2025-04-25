# backend/backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/user/', include('user_module.urls')),
    path('api/inventory/', include('inventory.urls')),

    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
        
    path('', RedirectView.as_view(url='/admin/'), name='home'),
]