(function () {
    var backgroundVideo = document.querySelector('.background-video');
    if (backgroundVideo) backgroundVideo.playbackRate = 0.75;

    var storageKey = 'abs-calendar-events';
    var adminPassword = 'herostinky';
    var currentDate = new Date();
    var events = loadEvents();

    var monthLabel = document.getElementById('month-label');
    var calendarGrid = document.getElementById('calendar-grid');
    var eventList = document.getElementById('event-list');
    var adminEvents = document.getElementById('admin-events');
    var adminPanel = document.getElementById('admin-panel');
    var eventForm = document.getElementById('event-form');
    var adminToggle = document.getElementById('admin-toggle');

    function loadEvents() {
        try {
            return JSON.parse(localStorage.getItem(storageKey)) || [];
        } catch (error) {
            return [];
        }
    }

    function saveEvents() {
        localStorage.setItem(storageKey, JSON.stringify(events));
    }

    function formatDate(dateString) {
        return new Date(dateString + 'T12:00:00').toLocaleDateString(undefined, {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        });
    }

    function renderCalendar() {
        var year = currentDate.getFullYear();
        var month = currentDate.getMonth();
        var firstDay = new Date(year, month, 1).getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var today = new Date();
        var todayString = toDateString(today);

        monthLabel.textContent = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        calendarGrid.innerHTML = '';

        for (var blank = 0; blank < firstDay; blank += 1) {
            calendarGrid.appendChild(document.createElement('span'));
        }

        for (var day = 1; day <= daysInMonth; day += 1) {
            var date = new Date(year, month, day);
            var dateString = toDateString(date);
            var cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'calendar-day';
            cell.textContent = day;
            cell.dataset.date = dateString;
            cell.setAttribute('aria-label', formatDate(dateString));

            if (dateString === todayString) cell.classList.add('is-today');
            if (events.some(function (event) { return event.date === dateString; })) cell.classList.add('has-event');
            cell.addEventListener('click', selectDate);
            calendarGrid.appendChild(cell);
        }
    }

    function renderEvents() {
        var upcoming = events.slice().sort(function (first, second) {
            return first.date.localeCompare(second.date);
        }).filter(function (event) {
            return event.date >= toDateString(new Date());
        });

        eventList.innerHTML = upcoming.length ? '' : '<p class="empty-state">No upcoming events yet.</p>';
        upcoming.slice(0, 6).forEach(function (event) {
            var item = document.createElement('article');
            item.className = 'event-item';
            item.innerHTML = '<time>' + formatDate(event.date) + '</time><h3>' + escapeHtml(event.title) + '</h3><p>' + escapeHtml(event.time || 'Details coming soon') + '</p>';
            if (event.details) item.innerHTML += '<p>' + escapeHtml(event.details) + '</p>';
            eventList.appendChild(item);
        });
    }

    function renderAdminEvents() {
        adminEvents.innerHTML = events.length ? '<p class="admin-list-label">SAVED EVENTS</p>' : '<p class="empty-state">No saved events.</p>';
        events.slice().sort(function (first, second) { return first.date.localeCompare(second.date); }).forEach(function (event) {
            var item = document.createElement('div');
            item.className = 'admin-event-row';
            item.innerHTML = '<span><strong>' + escapeHtml(event.title) + '</strong><small>' + formatDate(event.date) + '</small></span><span><button type="button" data-edit="' + event.id + '">Edit</button><button type="button" data-delete="' + event.id + '">Delete</button></span>';
            adminEvents.appendChild(item);
        });
    }

    function selectDate(event) {
        document.getElementById('event-date').value = event.currentTarget.dataset.date;
        if (adminPanel.hidden) toggleAdmin();
        document.getElementById('event-title').focus();
    }

    function toggleAdmin() {
        if (adminPanel.hidden && sessionStorage.getItem('abs-admin-unlocked') !== 'true') {
            var password = window.prompt('Enter the admin password:');
            if (password !== adminPassword) {
                window.alert('Incorrect admin password.');
                return;
            }
            sessionStorage.setItem('abs-admin-unlocked', 'true');
        }

        adminPanel.hidden = !adminPanel.hidden;
        adminToggle.setAttribute('aria-expanded', String(!adminPanel.hidden));
        adminToggle.textContent = adminPanel.hidden ? 'Admin mode' : 'Close admin';
        if (!adminPanel.hidden) renderAdminEvents();
    }

    function clearForm() {
        eventForm.reset();
        document.getElementById('event-id').value = '';
    }

    eventForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var id = document.getElementById('event-id').value || String(Date.now());
        var data = {
            id: id,
            date: document.getElementById('event-date').value,
            title: document.getElementById('event-title').value.trim(),
            time: document.getElementById('event-time').value.trim(),
            details: document.getElementById('event-details').value.trim()
        };
        var existingIndex = events.findIndex(function (item) { return item.id === id; });
        if (existingIndex >= 0) events[existingIndex] = data;
        else events.push(data);
        saveEvents();
        clearForm();
        renderAll();
    });

    adminEvents.addEventListener('click', function (event) {
        var editId = event.target.dataset.edit;
        var deleteId = event.target.dataset.delete;
        if (editId) {
            var item = events.find(function (savedEvent) { return savedEvent.id === editId; });
            document.getElementById('event-id').value = item.id;
            document.getElementById('event-date').value = item.date;
            document.getElementById('event-title').value = item.title;
            document.getElementById('event-time').value = item.time;
            document.getElementById('event-details').value = item.details;
            document.getElementById('event-title').focus();
        }
        if (deleteId) {
            events = events.filter(function (savedEvent) { return savedEvent.id !== deleteId; });
            saveEvents();
            renderAll();
        }
    });

    document.getElementById('previous-month').addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('next-month').addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    document.getElementById('clear-form').addEventListener('click', clearForm);
    adminToggle.addEventListener('click', toggleAdmin);

    function renderAll() {
        renderCalendar();
        renderEvents();
        renderAdminEvents();
    }

    function toDateString(date) {
        return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>'"]/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character];
        });
    }

    renderAll();
})();
