// Data storage
let questions = JSON.parse(localStorage.getItem('questions')) || [];
let students = JSON.parse(localStorage.getItem('students')) || [];
let answers = JSON.parse(localStorage.getItem('answers')) || [];
let results = JSON.parse(localStorage.getItem('results')) || [];

// DOM elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load sample data if storage is empty
    if (questions.length === 0) {
        loadSampleData();
    }
    
    // Initialize UI components
    initializeApp();
    
    // Set up event listeners
    setupEventListeners();
});

function loadSampleData() {
    // Sample questions
    questions = [
        { id: 1, subject: "math", question: "Solve for x: 2x + 5 = 15", answer: "x = 5", marks: 5 },
        { id: 2, subject: "science", question: "What is the chemical symbol for gold?", answer: "Au", marks: 3 },
        { id: 3, subject: "english", question: "Define 'metaphor' and provide an example", answer: "A figure of speech that compares two unlike things without using 'like' or 'as'. Example: 'Time is a thief.'", marks: 5 }
    ];
    
    // Sample students
    students = [
        { id: 1, name: "John Smith", class: "Grade 10", arm: "A" },
        { id: 2, name: "Emma Johnson", class: "Grade 10", arm: "B" },
        { id: 3, name: "Michael Brown", class: "Grade 10", arm: "A" },
        { id: 4, name: "Sarah Davis", class: "Grade 10", arm: "C" }
    ];
    
    // Sample answers
    answers = [
        { id: 1, studentId: 1, questionId: 1, answer: "x = 5", image: null, score: 5 },
        { id: 2, studentId: 1, questionId: 2, answer: "Au", image: null, score: 3 },
        { id: 3, studentId: 1, questionId: 3, answer: "A comparison without like or as. Time is a thief.", image: null, score: 5 },
        { id: 4, studentId: 2, questionId: 1, answer: "x = 10", image: null, score: 0 },
        { id: 5, studentId: 2, questionId: 2, answer: "Ag", image: null, score: 0 },
        { id: 6, studentId: 2, questionId: 3, answer: "A comparison using like or as. Example: Her smile was like sunshine.", image: null, score: 2 }
    ];
    
    // Save to localStorage
    saveDataToLocalStorage();
}

function initializeApp() {
    renderQuestionsTable();
    populateQuestionSelect();
    populateStudentFilter();
    renderMarkingTable();
    updateResultsSummary();
    renderResultsTable();
}

function setupEventListeners() {
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and content
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show corresponding content
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Image upload functionality
    document.getElementById('uploadArea').addEventListener('click', () => {
        document.getElementById('imageUpload').click();
    });
    
    document.getElementById('imageUpload').addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const preview = document.getElementById('imagePreview');
                preview.innerHTML = `
                    <div style="margin-top: 15px; border: 1px solid #ddd; padding: 10px; border-radius: 8px; display: inline-block;">
                        <img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 5px;">
                        <div style="margin-top: 10px;">
                            <button class="btn btn-outline" id="removeImageBtn" style="padding: 5px 10px; font-size: 14px;">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                `;
                
                document.getElementById('removeImageBtn').addEventListener('click', () => {
                    preview.innerHTML = '';
                    document.getElementById('imageUpload').value = '';
                });
            }
            
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Add question functionality
    document.getElementById('addQuestionBtn').addEventListener('click', addQuestion);
    
    // Submit answer functionality
    document.getElementById('submitAnswerBtn').addEventListener('click', submitAnswer);
    
    // Filter change listeners
    document.getElementById('studentFilter').addEventListener('change', renderMarkingTable);
    document.getElementById('resultsSubjectFilter').addEventListener('change', renderResultsTable);
    
    // Export and print buttons
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    document.getElementById('printBtn').addEventListener('click', printResults);
}

// Data functions
function saveDataToLocalStorage() {
    localStorage.setItem('questions', JSON.stringify(questions));
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('answers', JSON.stringify(answers));
    localStorage.setItem('results', JSON.stringify(results));
}

function getNextQuestionId() {
    return questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
}

function getNextStudentId() {
    return students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
}

function getNextAnswerId() {
    return answers.length > 0 ? Math.max(...answers.map(a => a.id)) + 1 : 1;
}

// UI rendering functions
function renderQuestionsTable() {
    const tableBody = document.getElementById('questionsTable');
    tableBody.innerHTML = '';
    
    questions.forEach(q => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${q.id}</td>
            <td>${q.subject.charAt(0).toUpperCase() + q.subject.slice(1)}</td>
            <td>${q.question}</td>
            <td>${q.answer}</td>
            <td>${q.marks}</td>
            <td>
                <button class="btn btn-outline edit-btn" data-id="${q.id}" style="padding: 5px 10px; font-size: 14px;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline delete-btn" data-id="${q.id}" style="padding: 5px 10px; font-size: 14px; margin-left: 5px;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editQuestion(btn.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteQuestion(btn.getAttribute('data-id')));
    });
}

function populateQuestionSelect() {
    const select = document.getElementById('questionSelect');
    select.innerHTML = '<option value="">-- Select a question --</option>';
    
    questions.forEach(q => {
        const option = document.createElement('option');
        option.value = q.id;
        option.textContent = `Q${q.id}: ${q.question.substring(0, 50)}${q.question.length > 50 ? '...' : ''}`;
        select.appendChild(option);
    });
}

function populateStudentFilter() {
    const select = document.getElementById('studentFilter');
    select.innerHTML = '<option value="">All Students</option>';
    
    students.forEach(s => {
        const option = document.createElement('option');
        option.value = s.id;
        option.textContent = s.name;
        select.appendChild(option);
    });
}

function renderMarkingTable() {
    const tableBody = document.getElementById('markingTable');
    tableBody.innerHTML = '';
    
    const studentFilter = document.getElementById('studentFilter').value;
    
    answers.forEach(a => {
        const question = questions.find(q => q.id === a.questionId);
        const student = students.find(s => s.id === a.studentId);
        
        if (!question || !student) return;
        
        // Apply filter
        if (studentFilter && studentFilter != a.studentId) return;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${question.question.substring(0, 40)}${question.question.length > 40 ? '...' : ''}</td>
            <td>${a.answer || '<span class="badge badge-warning">Image Answer</span>'}</td>
            <td>${question.answer}</td>
            <td>${a.answer ? 'Text' : 'Image'}</td>
            <td>
                <input type="number" min="0" max="${question.marks}" value="${a.score}" 
                       class="score-input" data-id="${a.id}" 
                       style="width: 60px; padding: 5px; border-radius: 4px; border: 1px solid #ddd;">
            </td>
            <td>
                <button class="btn btn-outline save-score-btn" data-id="${a.id}" style="padding: 5px 10px; font-size: 14px;">
                    <i class="fas fa-save"></i> Save
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners for save buttons
    document.querySelectorAll('.save-score-btn').forEach(btn => {
        btn.addEventListener('click', () => saveScore(btn.getAttribute('data-id')));
    });
}

function updateResultsSummary() {
    document.getElementById('totalStudents').textContent = students.length;
    
    // Calculate average and highest scores
    if (results.length > 0) {
        const totalPercentage = results.reduce((sum, result) => sum + result.percentage, 0);
        const averagePercentage = Math.round(totalPercentage / results.length);
        const highestPercentage = Math.max(...results.map(r => r.percentage));
        
        document.getElementById('averageScore').textContent = `${averagePercentage}%`;
        document.getElementById('highestScore').textContent = `${highestPercentage}%`;
    } else {
        document.getElementById('averageScore').textContent = '0%';
        document.getElementById('highestScore').textContent = '0%';
    }
}

function renderResultsTable() {
    const tableBody = document.getElementById('resultsTable');
    tableBody.innerHTML = '';
    
    const subjectFilter = document.getElementById('resultsSubjectFilter').value;
    
    // Group answers by student
    const studentResults = {};
    
    answers.forEach(a => {
        const student = students.find(s => s.id === a.studentId);
        const question = questions.find(q => q.id === a.questionId);
        
        if (!student || !question) return;
        
        // Apply subject filter
        if (subjectFilter !== 'all' && question.subject !== subjectFilter) return;
        
        if (!studentResults[student.id]) {
            studentResults[student.id] = {
                student: student,
                answers: {},
                totalScore: 0,
                totalPossible: 0
            };
        }
        
        studentResults[student.id].answers[question.id] = {
            score: a.score,
            possible: question.marks
        };
        
        studentResults[student.id].totalScore += a.score;
        studentResults[student.id].totalPossible += question.marks;
    });
    
    // Convert to array and calculate percentages
    const resultsArray = Object.values(studentResults).map(result => {
        const percentage = Math.round((result.totalScore / result.totalPossible) * 100);
        return {
            ...result,
            percentage: percentage
        };
    });
    
    // Update results data and save
    results = resultsArray;
    saveDataToLocalStorage();
    
    // Update summary
    updateResultsSummary();
    
    // Update current subject display
    if (subjectFilter === 'all') {
        document.getElementById('currentSubject').textContent = 'All Subjects';
    } else {
        document.getElementById('currentSubject').textContent = 
            subjectFilter.charAt(0).toUpperCase() + subjectFilter.slice(1);
    }
    
    // Render table rows
    resultsArray.forEach(result => {
        const row = document.createElement('tr');
        
        // Get scores for the first 3 questions for display
        const q1 = result.answers[1] ? `${result.answers[1].score}/${result.answers[1].possible}` : '-';
        const q2 = result.answers[2] ? `${result.answers[2].score}/${result.answers[2].possible}` : '-';
        const q3 = result.answers[3] ? `${result.answers[3].score}/${result.answers[3].possible}` : '-';
        
        row.innerHTML = `
            <td>${result.student.name}</td>
            <td>${result.student.class}</td>
            <td>${result.student.arm}</td>
            <td>${q1}</td>
            <td>${q2}</td>
            <td>${q3}</td>
            <td>${result.totalScore}/${result.totalPossible}</td>
            <td>
                <div>${result.percentage}%</div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${result.percentage}%"></div>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Action functions
function addQuestion() {
    const subject = document.getElementById('subject').value;
    const questionText = document.getElementById('question').value;
    const answer = document.getElementById('correctAnswer').value;
    const marks = parseInt(document.getElementById('marks').value);
    
    if (!subject || !questionText || !answer || !marks) {
        alert('Please fill in all fields');
        return;
    }
    
    // Create new question
    const newQuestion = {
        id: getNextQuestionId(),
        subject: subject,
        question: questionText,
        answer: answer,
        marks: marks
    };
    
    questions.push(newQuestion);
    saveDataToLocalStorage();
    
    // Clear form
    document.getElementById('question').value = '';
    document.getElementById('correctAnswer').value = '';
    document.getElementById('marks
