// ============================================================
// GLOBAL VARIABLES (FIXED)
// ============================================================
let allClasses = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'SSC Special'];

const GROUP_LIST = ['Science', 'Commerce', 'Arts'];
const GROUP_ICONS = {
    'Science': '🔬',
    'Commerce': '💼',
    'Arts': '⚖️'
};
const GROUP_REQUIRED_CLASSES = ['Nine', 'Ten', 'SSC Special']; // SSC Special এর জন্য গ্রুপ আবশ্যক

// ============================================================
// TOGGLE GROUP FIELD (FIXED)
// ============================================================
function toggleGroupField(className) {
    const groupContainer = document.getElementById('groupFieldContainer');
    const groupSelect = document.getElementById('cousinGroup');
    const requiredMsg = document.getElementById('groupRequiredMsg');
    
    if (className && isGroupRequired(className)) {
        groupContainer.style.display = 'block';
        groupSelect.required = true;
        if (requiredMsg) {
            if (className === 'SSC Special') {
                requiredMsg.textContent = '⚠️ SSC Special এর জন্য গ্রুপ নির্বাচন আবশ্যক';
            } else {
                requiredMsg.textContent = '⚠️ (নবম-দশম) শ্রেণির জন্য গ্রুপ নির্বাচন আবশ্যক';
            }
            requiredMsg.style.color = '#ffd700';
        }
    } else {
        groupContainer.style.display = className ? 'block' : 'none';
        groupSelect.required = false;
        groupSelect.value = '';
        if (requiredMsg) {
            requiredMsg.textContent = 'গ্রুপ নির্বাচন ঐচ্ছিক (শুধু SSC ও SSC Special এর জন্য আবশ্যক)';
            requiredMsg.style.color = 'rgba(255,255,255,0.4)';
        }
    }
}
window.toggleGroupField = toggleGroupField;

// ============================================================
// RENDER FUNCTIONS (FIXED)
// ============================================================

// --- Class Buttons ---
function renderClassButtons() {
    const container = document.getElementById('classButtons');
    if (!container) return;
    container.innerHTML = '<div class="class-buttons-container">';
    allClasses.forEach(cls => {
        const btn = document.createElement('button');
        btn.className = 'class-btn' + (selectedClass === cls ? ' active' : '');
        // SSC Special এর জন্য বিশেষ আইকন
        btn.textContent = cls === 'SSC Special' ? '🎯 ' + cls : cls;
        btn.onclick = () => {
            selectedClass = cls;
            renderClassButtons();
            renderClassStudents(cls);
            document.getElementById('selectedClassName').textContent = cls === 'SSC Special' ? '🎯 ' + cls : cls;
            toggleGroupField(cls);
        };
        container.appendChild(btn);
    });
    container.innerHTML += '</div>';
}

// --- Class Students ---
function renderClassStudents(className) {
    const container = document.getElementById('classStudentsTable');
    if (!container) return;
    const students = {};
    for (let key in allStudents) {
        if (allStudents[key].class === className) {
            students[key] = allStudents[key];
        }
    }
    if (Object.keys(students).length === 0) {
        container.innerHTML = '<p class="empty-state">এই ক্লাসে কোনো ছাত্র/ছাত্রী নেই</p>';
        return;
    }
    let html = `<div class="table-responsive"><table><thead><tr><th>ছবি</th><th>নাম</th><th>আইডি</th><th>ক্লাস</th><th>গ্রুপ</th><th>অভিভাবকের মোবাইল</th><th>অ্যাকশন</th></tr></thead><tbody>`;
    for (let key in students) {
        const s = students[key];
        let groupBadge = '-';
        if (s.group && isGroupRequired(className)) {
            const icon = GROUP_ICONS[s.group] || '';
            if (className === 'SSC Special') {
                groupBadge = `<span class="ssc-special-badge">🎯 ${icon} ${s.group}</span>`;
            } else {
                groupBadge = `<span class="student-group-tag ${s.group.toLowerCase()}">${icon} ${s.group}</span>`;
            }
        }
        html += `<tr>
            <td><img src="${s.image || 'https://ui-avatars.com/api/?background=0a3b2e&color=fff&name=' + encodeURIComponent(s.name)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;"></td>
            <td>${s.name}</td>
            <td>${s.id}</td>
            <td>${s.class === 'SSC Special' ? '🎯 SSC Special' : s.class}</td>
            <td>${groupBadge}</td>
            <td>${s.guardianPhone || ''}</td>
            <td><button class="btn btn-red btn-sm" onclick="deleteStudent('${key}')">মুছুন</button></td>
        </tr>`;
    }
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// --- Add Student ---
document.getElementById('addCousinBtn').addEventListener('click', () => {
    const name = document.getElementById('cousinName').value.trim();
    const id = document.getElementById('cousinId').value.trim();
    const password = document.getElementById('cousinPass').value.trim();
    const group = document.getElementById('cousinGroup').value;
    const guardianPhone = document.getElementById('cousinGuardianPhone').value.trim();
    
    if (!name || !id || !password) {
        alert('নাম, আইডি এবং পাসওয়ার্ড দিন');
        return;
    }
    if (!selectedClass) {
        alert('ক্লাস নির্বাচন করুন');
        return;
    }
    
    // SSC, SSC Special ক্লাসের জন্য গ্রুপ চেক
    if (isGroupRequired(selectedClass)) {
        if (!group) {
            alert(`⚠️ ${selectedClass === 'SSC Special' ? '🎯 SSC Special' : selectedClass} শ্রেণির জন্য গ্রুপ নির্বাচন আবশ্যক!`);
            document.getElementById('cousinGroup').focus();
            return;
        }
    }
    
    const newStudent = {
        name: name,
        id: id,
        password: password,
        class: selectedClass,
        group: group || '',
        guardianPhone: guardianPhone || '',
        image: document.getElementById('studentImagePreview').src
    };
    
    const newRef = db.ref('students').push();
    newRef.set(newStudent).then(() => {
        document.getElementById('cousinName').value = '';
        document.getElementById('cousinId').value = '';
        document.getElementById('cousinPass').value = '';
        document.getElementById('cousinGroup').value = '';
        document.getElementById('cousinGuardianPhone').value = '';
        alert('✅ ছাত্র/ছাত্রী যোগ করা হয়েছে');
    }).catch((error) => {
        alert('❌ যোগ করতে সমস্যা হয়েছে: ' + error.message);
    });
});

// --- Routine Editor ---
function renderRoutineEditor() {
    const container = document.getElementById('routineEditArea');
    if (!container) return;
    
    const classSelect = document.getElementById('routineClassSelect');
    const daySelect = document.getElementById('routineDaySelect');
    const groupSelect = document.getElementById('routineGroupSelect');
    
    if (!classSelect || !daySelect) return;
    
    const className = classSelect.value || 'One';
    const dayName = daySelect.value || 'Sunday';
    const groupName = groupSelect ? groupSelect.value : '';
    
    let html = `<div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:20px;">
        <h4 style="margin-bottom:15px; color:white;">📝 ${className === 'SSC Special' ? '🎯 ' + className : className} - ${dayName} ${groupName ? '(' + getGroupDisplayName(groupName) + ')' : ''}</h4>`;
    
    // SSC Special এবং Nine/Ten এর জন্য গ্রুপ ভিত্তিক রুটিন
    if (isGroupRequired(className)) {
        const groupsToShow = groupName ? [groupName] : GROUP_LIST;
        
        groupsToShow.forEach(grp => {
            const key = className + '_' + grp;
            const currentValue = allRoutines[dayName] && allRoutines[dayName][key] ? allRoutines[dayName][key] : '';
            const icon = GROUP_ICONS[grp] || '';
            
            html += `
                <div style="display:flex; gap:10px; align-items:center; margin-top:10px; padding:8px; background:${groupName === grp ? 'rgba(255,215,0,0.05)' : 'transparent'}; border-radius:10px;">
                    <span style="font-weight:bold; min-width:100px; color:white;">${icon} ${grp}:</span>
                    <input type="text" class="routine-group-input" data-class="${className}" data-group="${grp}" data-day="${dayName}" value="${currentValue}" placeholder="বিষয় লিখুন..." style="flex:1; margin-bottom:0; color:white;">
                </div>
            `;
        });
        html += `
            <p style="font-size:12px; color:rgba(255,255,255,0.5); margin-top:12px;">
                <i class="fas fa-info-circle"></i> ⚠️ ${className === 'SSC Special' ? '🎯 SSC Special' : className} শ্রেণির প্রতিটি গ্রুপের জন্য আলাদা রুটিন দিন
            </p>
        `;
    } else {
        const currentValue = allRoutines[dayName] && allRoutines[dayName][className] ? allRoutines[dayName][className] : '';
        html += `
            <div style="display:flex; gap:10px; align-items:center; margin-top:10px;">
                <span style="font-weight:bold; min-width:60px; color:white;">বিষয়:</span>
                <input type="text" id="routineSingleInput" value="${currentValue}" placeholder="বিষয় লিখুন..." style="flex:1; margin-bottom:0; color:white;">
            </div>
        `;
        html += `
            <p style="font-size:12px; color:rgba(255,255,255,0.5); margin-top:12px;">
                <i class="fas fa-info-circle"></i> গ্রুপ প্রয়োজন নেই
            </p>
        `;
    }
    
    html += '</div>';
    
    html += `<div style="margin-top:20px;">
        <h4 style="color:white;">📋 সব রুটিন (${dayName})</h4>
        <div class="table-responsive">
            <table class="routine-table">
                <thead>
                    <tr>
                        <th>ক্লাস</th>
                        <th>গ্রুপ</th>
                        <th>বিষয়</th>
                    </tr>
                </thead>
                <tbody>`;
    
    allClasses.forEach(cls => {
        if (isGroupRequired(cls)) {
            GROUP_LIST.forEach(grp => {
                const key = cls + '_' + grp;
                const val = allRoutines[dayName] && allRoutines[dayName][key] ? allRoutines[dayName][key] : '-';
                const icon = GROUP_ICONS[grp] || '';
                const isActive = (cls === className && grp === groupName);
                const isSscSpecial = cls === 'SSC Special';
                html += `<tr style="${isActive ? 'background:rgba(255,215,0,0.05);' : ''}">
                    <td>${isSscSpecial ? '🎯 ' + cls : cls}</td>
                    <td><span class="${isSscSpecial ? 'ssc-special-badge' : 'student-group-tag ' + grp.toLowerCase()}">${isSscSpecial ? '🎯 ' + icon + ' ' + grp : icon + ' ' + grp}</span></td>
                    <td>${val}</td>
                </tr>`;
            });
        } else {
            const val = allRoutines[dayName] && allRoutines[dayName][cls] ? allRoutines[dayName][cls] : '-';
            const isActive = (cls === className && !groupName);
            html += `<tr style="${isActive ? 'background:rgba(255,215,0,0.05);' : ''}">
                <td>${cls}</td>
                <td>-</td>
                <td>${val}</td>
            </tr>`;
        }
    });
    
    html += `</tbody></table></div></div>`;
    container.innerHTML = html;
    
    // Event listeners for auto-save
    document.querySelectorAll('.routine-group-input').forEach(input => {
        input.addEventListener('input', function() {
            const className = this.dataset.class;
            const groupName = this.dataset.group;
            const dayName = this.dataset.day;
            const value = this.value.trim();
            
            const key = className + '_' + groupName;
            const updatedRoutines = { ...allRoutines };
            if (!updatedRoutines[dayName]) updatedRoutines[dayName] = {};
            updatedRoutines[dayName][key] = value;
            
            db.ref('routines').set(updatedRoutines);
        });
    });
    
    const singleInput = document.getElementById('routineSingleInput');
    if (singleInput) {
        singleInput.addEventListener('input', function() {
            const classSelect = document.getElementById('routineClassSelect');
            const daySelect = document.getElementById('routineDaySelect');
            
            if (!classSelect || !daySelect) return;
            
            const className = classSelect.value;
            const dayName = daySelect.value;
            const value = this.value.trim();
            
            const updatedRoutines = { ...allRoutines };
            if (!updatedRoutines[dayName]) updatedRoutines[dayName] = {};
            updatedRoutines[dayName][className] = value;
            
            db.ref('routines').set(updatedRoutines);
        });
    }
}

// --- Routine Modal ---
function renderRoutineModal() {
    const container = document.getElementById('routineContent');
    if (!container) return;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayName = days[today.getDay()];
    
    let html = `<div class="table-responsive"><table class="routine-table"><thead><tr><th>ক্লাস</th><th>গ্রুপ</th>`;
    days.forEach(day => {
        html += `<th>${day}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    allClasses.forEach(cls => {
        if (isGroupRequired(cls)) {
            GROUP_LIST.forEach(grp => {
                const key = cls + '_' + grp;
                const icon = GROUP_ICONS[grp] || '';
                const isSscSpecial = cls === 'SSC Special';
                html += `<tr><td><strong>${isSscSpecial ? '🎯 ' + cls : cls}</strong></td><td><span class="${isSscSpecial ? 'ssc-special-badge' : 'student-group-tag ' + grp.toLowerCase()}">${isSscSpecial ? '🎯 ' + icon + ' ' + grp : icon + ' ' + grp}</span></td>`;
                days.forEach(day => {
                    const val = allRoutines[day] && allRoutines[day][key] ? allRoutines[day][key] : '-';
                    const isToday = day === todayName;
                    html += `<td style="${isToday ? 'background:rgba(255,215,0,0.1); font-weight:bold;' : ''}">${val}</td>`;
                });
                html += '</tr>';
            });
        } else {
            html += `<tr><td><strong>${cls}</strong></td><td>-</td>`;
            days.forEach(day => {
                const val = allRoutines[day] && allRoutines[day][cls] ? allRoutines[day][cls] : '-';
                const isToday = day === todayName;
                html += `<td style="${isToday ? 'background:rgba(255,215,0,0.1); font-weight:bold;' : ''}">${val}</td>`;
            });
            html += '</tr>';
        }
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// --- Today Tomorrow Routine ---
function renderTodayTomorrowRoutine() {
    const container = document.getElementById('todayTomorrowRoutine');
    if (!container) return;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayName = days[today.getDay()];
    const tomorrowName = days[(today.getDay() + 1) % 7];
    
    let html = '<div class="routine-side-by-side">';
    
    html += `<div class="today-routine-card"><h3>📅 আজকের রুটিন (${todayName})</h3>`;
    let hasToday = false;
    if (allRoutines[todayName]) {
        const sortedKeys = Object.keys(allRoutines[todayName]).sort();
        for (let key of sortedKeys) {
            if (allRoutines[todayName][key]) {
                let displayName = key;
                let groupName = '';
                let isSscSpecial = false;
                for (let g of GROUP_LIST) {
                    if (key.endsWith('_' + g)) {
                        displayName = key.replace('_' + g, '');
                        groupName = g;
                        break;
                    }
                }
                if (displayName === 'SSC Special') {
                    isSscSpecial = true;
                }
                const icon = GROUP_ICONS[groupName] || '';
                const groupDisplay = groupName ? (isSscSpecial ? 
                    ` <span class="ssc-special-badge">🎯 ${icon} ${groupName}</span>` : 
                    ` <span class="student-group-tag ${groupName.toLowerCase()}">${icon} ${groupName}</span>`) : '';
                const classDisplay = isSscSpecial ? '🎯 ' + displayName : displayName;
                html += `<p><strong>${classDisplay}${groupDisplay}</strong>: ${allRoutines[todayName][key]}</p>`;
                hasToday = true;
            }
        }
    }
    if (!hasToday) {
        html += '<p style="color:rgba(255,255,255,0.6);">কোনো রুটিন নেই</p>';
    }
    html += '</div>';
    
    html += `<div class="tomorrow-routine-card"><h3>📅 আগামীকালের রুটিন (${tomorrowName})</h3>`;
    let hasTomorrow = false;
    if (allRoutines[tomorrowName]) {
        const sortedKeys = Object.keys(allRoutines[tomorrowName]).sort();
        for (let key of sortedKeys) {
            if (allRoutines[tomorrowName][key]) {
                let displayName = key;
                let groupName = '';
                let isSscSpecial = false;
                for (let g of GROUP_LIST) {
                    if (key.endsWith('_' + g)) {
                        displayName = key.replace('_' + g, '');
                        groupName = g;
                        break;
                    }
                }
                if (displayName === 'SSC Special') {
                    isSscSpecial = true;
                }
                const icon = GROUP_ICONS[groupName] || '';
                const groupDisplay = groupName ? (isSscSpecial ? 
                    ` <span class="ssc-special-badge">🎯 ${icon} ${groupName}</span>` : 
                    ` <span class="student-group-tag ${groupName.toLowerCase()}">${icon} ${groupName}</span>`) : '';
                const classDisplay = isSscSpecial ? '🎯 ' + displayName : displayName;
                html += `<p><strong>${classDisplay}${groupDisplay}</strong>: ${allRoutines[tomorrowName][key]}</p>`;
                hasTomorrow = true;
            }
        }
    }
    if (!hasTomorrow) {
        html += '<p style="color:rgba(255,255,255,0.6);">কোনো রুটিন নেই</p>';
    }
    html += '</div>';
    
    html += '</div>';
    container.innerHTML = html;
}

// --- Student Own Routine ---
function renderStudentOwnRoutine() {
    const container = document.getElementById('studentRoutineDisplay');
    const parentContainer = document.getElementById('studentOwnRoutine');
    
    if (!container || !parentContainer) return;
    
    if (currentRole !== 'student' || !currentUserKey || !allStudents[currentUserKey]) {
        parentContainer.style.display = 'none';
        return;
    }
    
    const student = allStudents[currentUserKey];
    const className = student.class;
    const groupName = student.group || '';
    
    if (!className) {
        parentContainer.style.display = 'none';
        return;
    }
    
    parentContainer.style.display = 'block';
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayName = days[today.getDay()];
    const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const todayBangla = banglaDays[today.getDay()];
    
    let routineKey = className;
    if (groupName && isGroupRequired(className)) {
        routineKey = className + '_' + groupName;
    }
    
    const isSscSpecial = className === 'SSC Special';
    const classDisplay = isSscSpecial ? '🎯 SSC Special' : className;
    const groupDisplay = groupName && isGroupRequired(className) ? 
        (isSscSpecial ? 
            `<span class="ssc-special-badge">🎯 ${GROUP_ICONS[groupName] || ''} ${groupName}</span>` : 
            `<span class="student-group-tag ${groupName.toLowerCase()}">${GROUP_ICONS[groupName] || ''} ${groupName}</span>`) : '';
    
    let html = `<div style="margin-bottom:15px; display:flex; justify-content:space-between; flex-wrap:wrap; align-items:center;">
        <div>
            <p style="font-size:16px;"><strong>📚 ক্লাস:</strong> ${classDisplay} ${groupDisplay}</p>
            <p style="font-size:14px; color:rgba(255,255,255,0.7);"><strong>📅 আজ:</strong> ${todayBangla} (${todayName})</p>
        </div>
        <div>
            <span style="background:#ffd700; color:#191970; padding:5px 15px; border-radius:20px; font-size:12px; font-weight:600;">
                <i class="fas fa-calendar-check"></i> আমার রুটিন
            </span>
        </div>
    </div>`;
    
    html += `<div class="table-responsive">
        <table class="routine-table" style="min-width:auto;">
            <thead>
                <tr>
                    <th style="width:40%;">দিন</th>
                    <th style="width:60%;">বিষয়</th>
                </tr>
            </thead>
            <tbody>`;
    
    let hasRoutine = false;
    days.forEach((day, index) => {
        let subject = '-';
        if (allRoutines[day] && allRoutines[day][routineKey]) {
            subject = allRoutines[day][routineKey];
            hasRoutine = true;
        }
        const isToday = day === todayName;
        const banglaDay = banglaDays[index];
        html += `<tr style="${isToday ? 'background:rgba(255,215,0,0.1); font-weight:bold;' : ''}">
            <td>${banglaDay} ${isToday ? ' 📌 (আজ)' : ''}</td>
            <td>${subject}</td>
        </tr>`;
    });
    
    html += `</tbody></table></div>`;
    
    if (!hasRoutine) {
        html += `<div style="text-align:center; padding:30px 0; color:rgba(255,255,255,0.5);">
            <i class="fas fa-calendar-times" style="font-size:40px; display:block; margin-bottom:10px; color:rgba(255,255,255,0.2);"></i>
            <p>আপনার জন্য এখনো কোনো রুটিন যোগ করা হয়নি।</p>
            <p style="font-size:12px;">অফিসে যোগাযোগ করুন রুটিন পেতে।</p>
        </div>`;
    } else {
        const todaySubject = allRoutines[todayName] && allRoutines[todayName][routineKey] ? allRoutines[todayName][routineKey] : null;
        if (todaySubject && todaySubject !== '-') {
            html += `<div style="margin-top:15px; padding:12px 18px; background:linear-gradient(135deg, #ffd700, #f5a623); border-radius:15px; color:#191970; text-align:center; font-weight:600;">
                <i class="fas fa-bell"></i> <strong>আজকের বিষয়:</strong> ${todaySubject}
            </div>`;
        }
    }
    
    container.innerHTML = html;
}

// --- Populate Selects ---
function populateAttendanceClassSelect() {
    const classSelect = document.getElementById('attendanceClassSelect');
    if (!classSelect) return;
    
    const selectedValue = classSelect.value;
    classSelect.innerHTML = '';
    allClasses.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls === 'SSC Special' ? '🎯 ' + cls : cls;
        classSelect.appendChild(option);
    });
    if (selectedValue && allClasses.includes(selectedValue)) {
        classSelect.value = selectedValue;
    }
}

function populateRoutineClassSelect() {
    const classSelect = document.getElementById('routineClassSelect');
    if (!classSelect) return;
    
    const selectedValue = classSelect.value;
    classSelect.innerHTML = '';
    allClasses.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls === 'SSC Special' ? '🎯 ' + cls : cls;
        classSelect.appendChild(option);
    });
    if (selectedValue && allClasses.includes(selectedValue)) {
        classSelect.value = selectedValue;
    }
    
    selectedRoutineClass = classSelect.value;
}

// --- UI Setup ---
function setupAdminUI() {
    document.getElementById('menuClassManager').style.display = 'block';
    document.getElementById('menuTeachers').style.display = 'block';
    document.getElementById('menuFeedback').style.display = 'block';
    document.getElementById('menuRoutineManager').style.display = 'block';
    document.getElementById('menuStudentFeedback').style.display = 'none';
    showPanel('dashboardPanel');
    populateClassCheckboxes();
    populateFeedbackClassFilter();
    populateAttendanceClassSelect();
    populateRoutineClassSelect();
    setupAttendance();
    toggleGroupField(null);
}

// --- Feedback ---
function populateFeedbackClassFilter() {
    const select = document.getElementById('feedbackClassFilter');
    if (!select) return;
    select.innerHTML = '<option value="all" style="color:white;">সব ক্লাস</option>';
    allClasses.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls === 'SSC Special' ? '🎯 SSC Special' : cls;
        option.style.color = 'white';
        select.appendChild(option);
    });
}

// --- Teacher Profile ---
function renderTeacherProfile(teacherData) {
    const container = document.getElementById('teacherProfileArea');
    if (!container) return;
    container.innerHTML = `
        <div style="display:flex; align-items:center; gap:20px; background:rgba(255,255,255,0.05); padding:20px; border-radius:20px;">
            <img src="${teacherData.image || 'https://ui-avatars.com/api/?background=1e7b4a&color=fff&name=' + encodeURIComponent(teacherData.name)}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid #ffd700;">
            <div>
                <h3 style="border:none; padding:0; color:white;">${teacherData.name}</h3>
                <p style="color:rgba(255,255,255,0.8);"><strong>আইডি:</strong> ${teacherData.id}</p>
                <p style="color:rgba(255,255,255,0.8);"><strong>ক্লাস:</strong> ${teacherData.classes ? teacherData.classes.map(c => c === 'SSC Special' ? '🎯 SSC Special' : c).join(', ') : ''}</p>
            </div>
        </div>
    `;
}

function renderTeacherAssignedClasses(teacherData) {
    const container = document.getElementById('teacherAssignedClasses');
    if (!container) return;
    const assignedClasses = teacherData.classes || [];
    if (assignedClasses.length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.5);">আপনার কোনো ক্লাস নেই</p>';
        return;
    }
    let html = '<h3 style="color:white;">আপনার ক্লাসসমূহ</h3><div style="display:flex; flex-wrap:wrap; gap:10px;">';
    assignedClasses.forEach(cls => {
        const displayClass = cls === 'SSC Special' ? '🎯 SSC Special' : cls;
        html += `<span style="background:#ffd700; color:#191970; padding:8px 16px; border-radius:30px; font-weight:bold;">${displayClass}</span>`;
    });
    html += '</div>';
    container.innerHTML = html;
    if (assignedClasses.length > 0) {
        renderTeacherClassStudents(assignedClasses[0]);
    }
}

function renderTeacherClassStudents(className) {
    const container = document.getElementById('teacherClassStudents');
    if (!container) return;
    const students = {};
    for (let key in allStudents) {
        if (allStudents[key].class === className) {
            students[key] = allStudents[key];
        }
    }
    if (Object.keys(students).length === 0) {
        container.innerHTML = `<p style="color:rgba(255,255,255,0.5);">${className === 'SSC Special' ? '🎯 SSC Special' : className} ক্লাসে কোনো ছাত্র/ছাত্রী নেই</p>`;
        return;
    }
    let html = `<h3 style="color:white;">${className === 'SSC Special' ? '🎯 SSC Special' : className} ক্লাসের ছাত্র/ছাত্রী</h3><div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px,1fr)); gap:10px;">`;
    for (let key in students) {
        const s = students[key];
        const icon = GROUP_ICONS[s.group] || '';
        const groupClass = s.group ? s.group.toLowerCase() : '';
        const isSscSpecial = s.class === 'SSC Special';
        html += `<div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:16px; text-align:center;">
            <img src="${s.image || 'https://ui-avatars.com/api/?background=0a3b2e&color=fff&name=' + encodeURIComponent(s.name)}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid #ffd700;">
            <p style="margin-top:5px; color:white;"><strong>${s.name}</strong></p>
            <p style="font-size:12px; color:rgba(255,255,255,0.5);">${s.id}</p>
            ${s.group && isGroupRequired(s.class) ? `<p style="font-size:11px; margin-top:3px;"><span class="${isSscSpecial ? 'ssc-special-badge' : 'student-group-tag ' + groupClass}">${isSscSpecial ? '🎯 ' + icon + ' ' + s.group : icon + ' ' + s.group}</span></p>` : ''}
        </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

// ============================================================
// CONSOLE LOG
// ============================================================
console.log('📚 মাস্টারমাইন্ড অ্যাকাডেমি সিস্টেম লোড হয়েছে');
console.log('🔥 Firebase Connected');
console.log('✅ অটো-সেভ সক্রিয় আছে');
console.log('✅ SSC Special ক্লাসের জন্য গ্রুপ বাধ্যতামূলক করা হয়েছে');
console.log('✅ Nine, Ten, SSC Special - সব ক্লাসের জন্য গ্রুপ আবশ্যক');
