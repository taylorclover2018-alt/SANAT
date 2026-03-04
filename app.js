:root {
    --primary: #4361ee;
    --primary-dark: #3a56d4;
    --primary-light: #4895ef;
    --secondary: #06d6a0;
    --secondary-dark: #05b588;
    --danger: #ef476f;
    --warning: #ffd166;
    --info: #4cc9f0;
    --dark: #1e1e2f;
    --dark-light: #2b2d42;
    --light: #f8f9fa;
    --gray: #6c757d;
    --gray-light: #e9ecef;
    --success: #06d6a0;
    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --gradient-success: linear-gradient(135deg, #06d6a0 0%, #05b588 100%);
    --gradient-danger: linear-gradient(135deg, #ef476f 0%, #d43f63 100%);
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
    --shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 20px 60px rgba(0, 0, 0, 0.12);
    --shadow-hover: 0 30px 80px rgba(0, 0, 0, 0.15);
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --border-radius: 16px;
    --border-radius-sm: 12px;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    background: #f0f2f5;
    color: var(--dark);
    line-height: 1.6;
    overflow-x: hidden;
}

/* Tema escuro */
body.dark-theme {
    background: #121212;
    color: #fff;
}

body.dark-theme .premium-card,
body.dark-theme .sidebar,
body.dark-theme .top-bar,
body.dark-theme .modal-content {
    background: var(--dark);
    border-color: #2d2d3a;
}

body.dark-theme input,
body.dark-theme select {
    background: #2d2d3a;
    border-color: #3d3d4a;
    color: #fff;
}

body.dark-theme .login-container {
    background: var(--dark);
}

/* Theme Toggle */
.theme-toggle {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: var(--gradient-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    color: white;
    font-size: 1.3rem;
    transition: var(--transition);
}

.theme-toggle:hover {
    transform: scale(1.1);
}

/* Login Overlay */
.login-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.login-container {
    background: white;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-lg);
    width: 90%;
    max-width: 400px;
    overflow: hidden;
    animation: slideIn 0.5s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-50px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.login-header {
    padding: 40px 30px 20px;
    text-align: center;
}

.login-header h2 {
    font-size: 2rem;
    margin: 10px 0 5px;
}

.login-header h2 span {
    color: var(--primary);
}

.login-header p {
    color: var(--gray);
}

.login-body {
    padding: 20px 30px 40px;
}

.login-info {
    margin-top: 30px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: var(--border-radius-sm);
    font-size: 0.9rem;
}

.login-info ul {
    margin-top: 10px;
    margin-left: 20px;
    color: var(--gray);
}

/* App Wrapper */
.app-wrapper {
    display: flex;
    min-height: 100vh;
}

/* Sidebar */
.sidebar {
    width: 280px;
    background: white;
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    transition: var(--transition);
    z-index: 100;
}

.sidebar-header {
    padding: 30px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid var(--gray-light);
}

.sidebar-logo {
    font-size: 2rem;
    color: var(--primary);
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.sidebar-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
}

.sidebar-header h2 span {
    color: var(--primary);
    font-weight: 800;
}

.user-profile {
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid var(--gray-light);
}

.user-profile i {
    font-size: 2.5rem;
    color: var(--primary);
}

.user-profile p {
    font-weight: 600;
}

.user-profile small {
    color: var(--success);
}

.sidebar-nav {
    flex: 1;
    padding: 20px;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    color: var(--gray);
    text-decoration: none;
    border-radius: var(--border-radius-sm);
    margin-bottom: 5px;
    transition: var(--transition);
}

.nav-item i {
    font-size: 1.2rem;
    width: 24px;
}

.nav-item:hover {
    background: var(--gray-light);
    color: var(--primary);
    transform: translateX(5px);
}

.nav-item.active {
    background: var(--gradient-primary);
    color: white;
    box-shadow: 0 10px 20px rgba(67, 97, 238, 0.3);
}

.nav-item.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.sidebar-footer {
    padding: 20px;
    border-top: 1px solid var(--gray-light);
}

/* Main Content */
.main-content {
    flex: 1;
    margin-left: 280px;
    padding: 20px;
}

/* Top Bar */
.top-bar {
    background: white;
    border-radius: var(--border-radius);
    padding: 15px 25px;
    margin-bottom: 25px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: var(--shadow-sm);
}

.top-bar-left {
    display: flex;
    align-items: center;
    gap: 20px;
}

.menu-toggle {
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--gray);
}

.top-bar-right {
    display: flex;
    align-items: center;
    gap: 20px;
}

.date-display {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--gray);
}

.notifications {
    position: relative;
    cursor: pointer;
}

.notifications i {
    font-size: 1.3rem;
    color: var(--gray);
}

.notifications .badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: var(--danger);
    color: white;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 10px;
}

/* Content Area */
.content-area {
    min-height: calc(100vh - 140px);
}

.page {
    display: none;
    animation: fadeIn 0.5s ease;
}

.page.active {
    display: block;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Cards */
.premium-card {
    background: white;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    transition: var(--transition);
    margin-bottom: 25px;
    overflow: hidden;
}

.premium-card:hover {
    box-shadow: var(--shadow-hover);
    transform: translateY(-2px);
}

.card-header {
    padding: 20px 25px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.card-header h3 {
    font-size: 1.2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.card-header h3 i {
    color: var(--primary);
}

.card-body {
    padding: 25px;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 25px;
}

.stat-card {
    background: white;
    border-radius: var(--border-radius);
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: var(--shadow);
    transition: var(--transition);
}

.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-hover);
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
}

.stat-info h3 {
    font-size: 0.9rem;
    color: var(--gray);
    margin-bottom: 5px;
}

.stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 5px;
}

.stat-trend {
    font-size: 0.8rem;
}

.stat-trend.positive {
    color: var(--success);
}

.stat-trend.negative {
    color: var(--danger);
}

/* Charts */
.charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 25px;
}

.chart-select {
    padding: 8px 15px;
    border: 1px solid var(--gray-light);
    border-radius: var(--border-radius-sm);
    background: white;
}

/* Rotas Container */
.rotas-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
    gap: 25px;
    margin-bottom: 30px;
}

.rota-card.modern {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.rota-header {
    padding: 15px 20px;
    background: rgba(67, 97, 238, 0.05);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.rota-title {
    display: flex;
    align-items: center;
    gap: 10px;
}

.rota-title i {
    color: var(--primary);
    font-size: 1.2rem;
}

.rota-title h4 {
    font-weight: 600;
}

.rota-stats {
    display: flex;
    gap: 15px;
}

.rota-stat {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.9rem;
    color: var(--gray);
}

.rota-body {
    padding: 20px;
}

/* Inputs */
.input-group {
    margin-bottom: 15px;
}

.input-group label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 5px;
    color: var(--gray);
}

.input-group label i {
    color: var(--primary);
    font-size: 0.9rem;
}

input, select {
    width: 100%;
    padding: 12px 15px;
    border: 2px solid var(--gray-light);
    border-radius: var(--border-radius-sm);
    font-size: 1rem;
    transition: var(--transition);
    background: white;
}

input:focus, select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(67, 97, 238, 0.1);
}

.row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

/* Veículos */
.veiculos-section {
    margin-top: 20px;
    border-top: 1px dashed var(--gray-light);
    padding-top: 20px;
}

.veiculos-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
}

.veiculos-header h5 {
    display: flex;
    align-items: center;
    gap: 5px;
}

.veiculos-control {
    display: flex;
    align-items: center;
    gap: 10px;
}

.veiculos-control input {
    width: 70px;
    text-align: center;
}

.veiculos-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.veiculo-card {
    background: white;
    border: 1px solid var(--gray-light);
    border-radius: var(--border-radius-sm);
    padding: 15px;
    box-shadow: var(--shadow-sm);
    animation: fadeIn 0.3s ease;
}

.veiculo-card h4 {
    margin-bottom: 10px;
    color: var(--primary);
}

.veiculo-card h4 i {
    margin-right: 5px;
}

/* Actions */
.actions {
    display: flex;
    gap: 15px;
    margin-top: 30px;
    flex-wrap: wrap;
}

.btn {
    padding: 12px 25px;
    border: none;
    border-radius: var(--border-radius-sm);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.btn i {
    font-size: 1.1rem;
}

.btn-primary {
    background: var(--gradient-primary);
    color: white;
    box-shadow: 0 10px 20px rgba(67, 97, 238, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(67, 97, 238, 0.4);
}

.btn-secondary {
    background: var(--gradient-success);
    color: white;
}

.btn-outline {
    background: transparent;
    border: 2px solid var(--primary);
    color: var(--primary);
}

.btn-outline:hover {
    background: var(--primary);
    color: white;
}

.btn-large {
    padding: 15px 35px;
    font-size: 1.1rem;
}

.btn-danger {
    background: var(--gradient-danger);
    color: white;
}

/* Resultado Preview */
.resultado-preview {
    margin-top: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: var(--border-radius-sm);
}

.resultado-preview h4 {
    margin-bottom: 15px;
    color: var(--primary);
}

/* Tables */
.premium-table {
    width: 100%;
    border-collapse: collapse;
}

.premium-table th {
    background: var(--primary);
    color: white;
    padding: 12px;
    font-weight: 600;
    text-align: left;
}

.premium-table td {
    padding: 12px;
    border-bottom: 1px solid var(--gray-light);
}

.premium-table tr:hover {
    background: rgba(67, 97, 238, 0.05);
}

.premium-table .destaque {
    font-weight: 700;
    color: var(--primary);
}

.table-responsive {
    overflow-x: auto;
}

/* Badges */
.badge-status {
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
}

.badge-status.success {
    background: rgba(6, 214, 160, 0.2);
    color: var(--success);
}

.btn-icon {
    width: 35px;
    height: 35px;
    border: none;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    transition: var(--transition);
}

.btn-icon:hover {
    background: var(--gray-light);
    transform: scale(1.1);
}

.btn-icon i {
    font-size: 1rem;
}

/* Histórico Filtros */
.historico-filtros {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 15px;
    margin-bottom: 20px;
    align-items: end;
}

/* Veículos Grid */
.veiculos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
}

.veiculo-card-detalhado {
    background: white;
    border: 1px solid var(--gray-light);
    border-radius: var(--border-radius-sm);
    overflow: hidden;
    transition: var(--transition);
}

.veiculo-card-detalhado:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow);
}

.veiculo-header {
    padding: 15px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-bottom: 1px solid var(--gray-light);
    display: flex;
    align-items: center;
    gap: 10px;
}

.veiculo-header i {
    font-size: 1.5rem;
    color: var(--primary);
}

.veiculo-header h4 {
    flex: 1;
}

.veiculo-status {
    padding: 3px 8px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
}

.veiculo-status.ativo {
    background: rgba(6, 214, 160, 0.2);
    color: var(--success);
}

.veiculo-body {
    padding: 15px;
}

.veiculo-body p {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.veiculo-body p i {
    width: 20px;
    color: var(--primary);
}

.veiculo-footer {
    padding: 15px;
    border-top: 1px solid var(--gray-light);
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

/* Relatórios Grid */
.relatorios-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.relatorio-card {
    background: white;
    border: 1px solid var(--gray-light);
    border-radius: var(--border-radius-sm);
    padding: 25px;
    text-align: center;
    cursor: pointer;
    transition: var(--transition);
}

.relatorio-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow);
    border-color: var(--primary);
}

.relatorio-card i {
    font-size: 2.5rem;
    color: var(--primary);
    margin-bottom: 15px;
}

.relatorio-card h4 {
    margin-bottom: 5px;
}

.relatorio-card p {
    color: var(--gray);
    font-size: 0.9rem;
}

/* Modal */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: fadeIn 0.3s ease;
}

.modal-content {
    background: white;
    border-radius: var(--border-radius);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-large {
    max-width: 800px;
}

.modal-header {
    padding: 20px;
    border-bottom: 1px solid var(--gray-light);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--gray);
    transition: var(--transition);
}

.modal-close:hover {
    color: var(--danger);
    transform: rotate(90deg);
}

.modal-body {
    padding: 20px;
}

.modal-footer {
    padding: 20px;
    border-top: 1px solid var(--gray-light);
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

/* Toast Notification */
.toast-notification {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: linear-gradient(135deg, #06d6a0 0%, #05b588 100%);
    color: white;
    padding: 15px 25px;
    border-radius: var(--border-radius-sm);
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: var(--shadow-lg);
    transform: translateX(400px);
    transition: transform 0.3s ease;
    z-index: 2000;
}

.toast-notification.show {
    transform: translateX(0);
}

/* Loading */
.loading {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Mobile Responsive */
@media (max-width: 1024px) {
    .sidebar {
        transform: translateX(-100%);
    }
    
    .sidebar.active {
        transform: translateX(0);
    }
    
    .main-content {
        margin-left: 0;
    }
    
    .menu-toggle {
        display: block;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .charts-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }
    
    .rotas-container {
        grid-template-columns: 1fr;
    }
    
    .actions {
        flex-direction: column;
    }
    
    .actions .btn {
        width: 100%;
    }
    
    .historico-filtros {
        grid-template-columns: 1fr;
    }
    
    .top-bar-right .date-display {
        display: none;
    }
}
