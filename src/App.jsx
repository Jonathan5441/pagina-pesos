import { useState, useEffect } from 'react';
import UserCard from './components/UserCard';
import UserDetail from './components/UserDetail';
import { initialUsers } from './data/initialData';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');


  // Load users from localStorage or use initial data
  useEffect(() => {
    const savedUsers = localStorage.getItem('weightTrackerUsers');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      setUsers(initialUsers);
    }
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('weightTrackerUsers', JSON.stringify(users));
    }
  }, [users]);

  const handleUpdateUser = (updatedUser) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setSelectedUser(updatedUser);
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    return user.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (selectedUser) {
    return (
      <div className="app">
        <div className="container">
          <UserDetail
            user={selectedUser}
            onBack={() => setSelectedUser(null)}
            onUpdateUser={handleUpdateUser}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">
              <span className="title-icon"></span>
              Monitor de Peso DAIA
            </h1>
            <p className="app-subtitle">Seguimiento de peso e índice de masa corporal by Kevin Apolo</p>
          </div>
        </header>

        <div className="controls-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>


        </div>

        <div className="users-grid">
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onClick={setSelectedUser}
            />
          ))}

          {filteredUsers.length === 0 && (
            <div className="empty-state-large">
              <span className="empty-icon">🔍</span>
              <h3>No se encontraron usuarios</h3>
              <p>Intenta con otro término de búsqueda o filtro</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
