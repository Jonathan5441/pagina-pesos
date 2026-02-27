import { useState, useEffect } from 'react';
import UserCard from './components/UserCard';
import UserDetail from './components/UserDetail';
import Leaderboard from './components/Leaderboard';
import GroupStats from './components/GroupStats';
import { fetchUsers, updateHeight } from './services/sheetsService';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuarios desde Google Sheets
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsers();
      setUsers(data);

      // Si hay un usuario seleccionado, actualizar sus datos
      if (selectedUser) {
        const updated = data.find(u => u.id === selectedUser.id);
        if (updated) setSelectedUser(updated);
      }
    } catch (err) {
      setError('Error al cargar los datos. Verifica tu conexión.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateHeight = async (userId, height) => {
    try {
      await updateHeight(userId, height);
      // Recargar datos después de actualizar
      await loadUsers();
    } catch (err) {
      console.error('Error al actualizar altura:', err);
    }
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
            onUpdateHeight={handleUpdateHeight}
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
          <button className="btn btn-refresh" onClick={loadUsers} title="Actualizar datos">
            🔄 Actualizar
          </button>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando datos...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <span>⚠️</span>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadUsers}>Reintentar</button>
          </div>
        )}

        {!loading && !error && (
          <>
            <Leaderboard users={users} />
            <GroupStats users={users} />
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
          </>
        )}
      </div>
    </div>
  );
}

export default App;
