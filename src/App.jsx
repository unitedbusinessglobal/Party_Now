import React, { useState, useEffect } from 'react';
import { Calendar, User, ChefHat, Check, Plus, Trash2, Settings, Users } from 'lucide-react';

export default function MenuCalendar() {
  const [appView, setAppView] = useState('partyList'); // 'partyList', 'createParty', 'partyDetail'
  const [parties, setParties] = useState({});
  const [currentPartyId, setCurrentPartyId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Party creation form
  const [newParty, setNewParty] = useState({
    name: '',
    startDate: '',
    endDate: '',
    menuItems: []
  });
  const [newMenuItem, setNewMenuItem] = useState('');

  // Party detail view states
  const [view, setView] = useState('user'); // 'user', 'admin', 'summary'
  const [selectedDate, setSelectedDate] = useState('');
  const [currentUser, setCurrentUser] = useState('');

  // Load all parties
  useEffect(() => {
    loadParties();
  }, []);

  const loadParties = async () => {
    try {
      setIsLoading(true);
      const result = await window.storage.get('all-parties', true);
      if (result?.value) {
        setParties(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('No existing parties found');
    } finally {
      setIsLoading(false);
    }
  };

  const saveParties = async (updatedParties) => {
    try {
      await window.storage.set('all-parties', JSON.stringify(updatedParties), true);
      setParties(updatedParties);
    } catch (error) {
      console.error('Failed to save parties:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const createParty = () => {
    if (!newParty.name.trim() || !newParty.startDate || !newParty.endDate) {
      alert('Please fill in party name, start date, and end date');
      return;
    }

    if (newParty.menuItems.length === 0) {
      alert('Please add at least one menu item');
      return;
    }

    const partyId = `party-${Date.now()}`;
    const party = {
      id: partyId,
      name: newParty.name.trim(),
      startDate: newParty.startDate,
      endDate: newParty.endDate,
      menuItems: newParty.menuItems,
      selections: {},
      createdAt: new Date().toISOString()
    };

    const updatedParties = {
      ...parties,
      [partyId]: party
    };

    saveParties(updatedParties);
    setNewParty({ name: '', startDate: '', endDate: '', menuItems: [] });
    setAppView('partyList');
    alert('Party created successfully!');
  };

  const deleteParty = async (partyId) => {
    if (confirm('Are you sure you want to delete this party? This cannot be undone.')) {
      const updatedParties = { ...parties };
      delete updatedParties[partyId];
      saveParties(updatedParties);
    }
  };

  const addMenuItem = () => {
    if (!newMenuItem.trim()) return;
    setNewParty({
      ...newParty,
      menuItems: [...newParty.menuItems, newMenuItem.trim()]
    });
    setNewMenuItem('');
  };

  const removeMenuItem = (index) => {
    setNewParty({
      ...newParty,
      menuItems: newParty.menuItems.filter((_, i) => i !== index)
    });
  };

  const openParty = (partyId) => {
    setCurrentPartyId(partyId);
    const party = parties[partyId];
    setSelectedDate(party.startDate);
    setAppView('partyDetail');
  };

  const handleSelectItem = (item) => {
    if (!currentUser.trim()) {
      alert('Please enter your name first!');
      return;
    }

    const party = parties[currentPartyId];
    const daySelections = party.selections[selectedDate] || {};

    if (daySelections[item]) {
      alert(`This item has already been selected by ${daySelections[item]}`);
      return;
    }

    const updatedParty = {
      ...party,
      selections: {
        ...party.selections,
        [selectedDate]: {
          ...daySelections,
          [item]: currentUser.trim()
        }
      }
    };

    const updatedParties = {
      ...parties,
      [currentPartyId]: updatedParty
    };

    saveParties(updatedParties);
  };

  const resetPartyData = async () => {
    if (confirm('Are you sure you want to reset all selections for this party?')) {
      const updatedParty = {
        ...parties[currentPartyId],
        selections: {}
      };
      const updatedParties = {
        ...parties,
        [currentPartyId]: updatedParty
      };
      saveParties(updatedParties);
      alert('Party selections have been reset!');
    }
  };

  const exportToCSV = () => {
    const party = parties[currentPartyId];
    let csv = 'Date,Menu Item,Selected By\n';
    
    const dates = Object.keys(party.selections).sort();
    dates.forEach(date => {
      const daySelections = party.selections[date];
      Object.entries(daySelections).forEach(([item, user]) => {
        csv += `"${date}","${item}","${user}"\n`;
      });
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${party.name.replace(/\s+/g, '-')}-selections.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getDateRange = (party) => {
    const start = new Date(party.startDate);
    const end = new Date(party.endDate);
    const range = [];
    const current = new Date(start);
    
    while (current <= end) {
      range.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return range;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // PARTY LIST VIEW
  if (appView === 'partyList') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-800">My Parties</h1>
              </div>
              <button
                onClick={() => setAppView('createParty')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create New Party
              </button>
            </div>
          </div>

          {Object.keys(parties).length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">No Parties Yet</h2>
              <p className="text-gray-600 mb-6">Create your first party to get started with menu planning!</p>
              <button
                onClick={() => setAppView('createParty')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Your First Party
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(parties).map(party => {
                const totalSelections = Object.values(party.selections).reduce(
                  (sum, day) => sum + Object.keys(day).length, 0
                );
                const dateRange = getDateRange(party);

                return (
                  <div key={party.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{party.name}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(party.startDate).toLocaleDateString()} - {new Date(party.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteParty(party.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium text-gray-800">{dateRange.length} days</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Menu Items:</span>
                        <span className="font-medium text-gray-800">{party.menuItems.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Selections:</span>
                        <span className="font-medium text-green-600">{totalSelections}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => openParty(party.id)}
                      className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Open Party
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // CREATE PARTY VIEW
  if (appView === 'createParty') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Create New Party</h1>
              <button
                onClick={() => setAppView('partyList')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-6">
              {/* Party Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Party Name *</label>
                <input
                  type="text"
                  placeholder="e.g., John's Birthday Week, Family Reunion"
                  value={newParty.name}
                  onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={newParty.startDate}
                    onChange={(e) => setNewParty({ ...newParty, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                  <input
                    type="date"
                    value={newParty.endDate}
                    onChange={(e) => setNewParty({ ...newParty, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Menu Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Menu Items *</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add a menu item"
                    value={newMenuItem}
                    onChange={(e) => setNewMenuItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addMenuItem()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    onClick={addMenuItem}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {newParty.menuItems.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {newParty.menuItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg group">
                        <span className="text-gray-800">{item}</span>
                        <button
                          onClick={() => removeMenuItem(idx)}
                          className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Create Button */}
              <button
                onClick={createParty}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Create Party
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PARTY DETAIL VIEW
  if (appView === 'partyDetail' && currentPartyId) {
    const party = parties[currentPartyId];
    const daySelections = party.selections[selectedDate] || {};
    const dateRange = getDateRange(party);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header with View Toggle */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <button
                  onClick={() => setAppView('partyList')}
                  className="text-indigo-600 hover:text-indigo-800 text-sm mb-2"
                >
                  ← Back to Parties
                </button>
                <div className="flex items-center gap-3">
                  <ChefHat className="w-8 h-8 text-indigo-600" />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">{party.name}</h1>
                    <p className="text-sm text-gray-600">
                      {new Date(party.startDate).toLocaleDateString()} - {new Date(party.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setView('user')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    view === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  User View
                </button>
                <button
                  onClick={() => setView('admin')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    view === 'admin'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Calendar View
                </button>
                <button
                  onClick={() => setView('summary')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    view === 'summary'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Summary Report
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Export to CSV
              </button>
              <button
                onClick={resetPartyData}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Reset All Selections
              </button>
            </div>
          </div>

          {/* USER VIEW */}
          {view === 'user' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                {/* Date Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {dateRange.map(date => (
                        <option key={date} value={date}>
                          {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* User Name Input */}
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={currentUser}
                    onChange={(e) => setCurrentUser(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Menu Items */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Menu for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h2>

                <div className="space-y-2">
                  {party.menuItems.map((item, idx) => {
                    const isSelected = !!daySelections[item];
                    const selectedBy = daySelections[item];
                    const isMySelection = selectedBy === currentUser.trim();

                    return (
                      <button
                        key={idx}
                        onClick={() => !isSelected && handleSelectItem(item)}
                        disabled={isSelected}
                        className={`w-full text-left p-4 rounded-lg transition-all ${
                          isSelected
                            ? isMySelection
                              ? 'bg-green-100 border-2 border-green-500 cursor-default'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-50 hover:bg-blue-100 border-2 border-transparent hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item}</span>
                          {isSelected && (
                            <div className="flex items-center gap-2">
                              <Check className="w-5 h-5 text-green-600" />
                              <span className="text-sm text-gray-600 font-medium">{selectedBy}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary of Selected Items */}
              {Object.keys(daySelections).length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Today's Selections</h3>
                  <div className="space-y-2">
                    {Object.entries(daySelections).map(([item, user]) => (
                      <div key={item} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-gray-700">{item}</span>
                        <span className="text-green-700 font-medium">{user}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADMIN CALENDAR VIEW */}
          {view === 'admin' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 bg-white rounded-lg shadow-lg p-4">
                Calendar Overview - All Dates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {dateRange.map((date) => {
                  const daySelections = party.selections[date] || {};
                  const hasSelections = Object.keys(daySelections).length > 0;
                  const dateObj = new Date(date + 'T00:00:00');

                  return (
                    <div 
                      key={date} 
                      className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
                        hasSelections ? 'border-2 border-green-400' : ''
                      }`}
                    >
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-gray-800">
                          {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {dateObj.toLocaleDateString('en-US', { weekday: 'long' })}
                        </p>
                      </div>

                      {hasSelections ? (
                        <div className="space-y-1.5 max-h-64 overflow-y-auto">
                          {Object.entries(daySelections).map(([item, user]) => (
                            <div key={item} className="bg-green-50 p-2 rounded text-sm">
                              <div className="font-medium text-gray-800 truncate">{item}</div>
                              <div className="text-green-700 text-xs">→ {user}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No selections yet</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUMMARY REPORT VIEW */}
          {view === 'summary' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Summary Report</h2>
              
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {Object.keys(party.selections).length}
                  </div>
                  <div className="text-sm text-gray-600">Days with Selections</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {Object.values(party.selections).reduce((sum, day) => sum + Object.keys(day).length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Selections Made</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {new Set(Object.values(party.selections).flatMap(day => Object.values(day))).size}
                  </div>
                  <div className="text-sm text-gray-600">Unique Participants</div>
                </div>
              </div>

              {/* Popular Items */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Most Popular Menu Items</h3>
                <div className="space-y-2">
                  {(() => {
                    const itemCounts = {};
                    Object.values(party.selections).forEach(day => {
                      Object.keys(day).forEach(item => {
                        itemCounts[item] = (itemCounts[item] || 0) + 1;
                      });
                    });
                    
                    return Object.entries(itemCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([item, count]) => (
                        <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-800">{item}</span>
                          <span className="text-indigo-600 font-bold">{count} times</span>
                        </div>
                      ));
                  })()}
                </div>
              </div>

              {/* User Activity */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Participant Activity</h3>
                <div className="space-y-2">
                  {(() => {
                    const userCounts = {};
                    Object.values(party.selections).forEach(day => {
                      Object.values(day).forEach(user => {
                        userCounts[user] = (userCounts[user] || 0) + 1;
                      });
                    });
                    
                    return Object.entries(userCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([user, count]) => (
                        <div key={user} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="font-medium text-gray-800">{user}</span>
                          </div>
                          <span className="text-green-600 font-bold">{count} selections</span>
                        </div>
                      ));
                  })()}
                </div>
              </div>

              {/* Detailed Timeline */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Complete Timeline</h3>
                <div className="space-y-4">
                  {Object.keys(party.selections).sort().reverse().map(date => {
                    const daySelections = party.selections[date];
                    const dateObj = new Date(date + 'T00:00:00');
                    
                    return (
                      <div key={date} className="border-l-4 border-indigo-500 pl-4 pb-4">
                        <h4 className="font-bold text-gray-800 mb-2">
                          {dateObj.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h4>
                        <div className="space-y-1">
                          {Object.entries(daySelections).map(([item, user]) => (
                            <div key={item} className="text-sm text-gray-700">
                              <span className="font-medium">{item}</span>
                              <span className="text-gray-500"> → {user}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

  const daySelections = selections[selectedDate] || {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with View Toggle */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">Daily Menu Selection</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView('user')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                User View
              </button>
              <button
                onClick={() => setView('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'admin'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Calendar View
              </button>
              <button
                onClick={() => setView('summary')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'summary'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Summary Report
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Export to CSV
            </button>
            <button
              onClick={resetAllData}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Reset All Selections
            </button>
          </div>
        </div>

        {/* USER VIEW */}
        {view === 'user' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              {/* Date Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* User Name Input */}
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-600" />
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={currentUser}
                  onChange={(e) => setCurrentUser(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Menu Items */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Menu for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>

              <div className="space-y-2">
                {fixedMenuItems.map((item, idx) => {
                  const isSelected = !!daySelections[item];
                  const selectedBy = daySelections[item];
                  const isMySelection = selectedBy === currentUser.trim();

                  return (
                    <button
                      key={idx}
                      onClick={() => !isSelected && handleSelectItem(item)}
                      disabled={isSelected}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        isSelected
                          ? isMySelection
                            ? 'bg-green-100 border-2 border-green-500 cursor-default'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-50 hover:bg-blue-100 border-2 border-transparent hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item}</span>
                        {isSelected && (
                          <div className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-gray-600 font-medium">{selectedBy}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary of Selected Items */}
            {Object.keys(daySelections).length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Today's Selections</h3>
                <div className="space-y-2">
                  {Object.entries(daySelections).map(([item, user]) => (
                    <div key={item} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700">{item}</span>
                      <span className="text-green-700 font-medium">{user}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADMIN CALENDAR VIEW */}
        {view === 'admin' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 bg-white rounded-lg shadow-lg p-4">
              Calendar Overview - All Dates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getDateRange().map((date) => {
                const daySelections = selections[date] || {};
                const hasSelections = Object.keys(daySelections).length > 0;
                const dateObj = new Date(date + 'T00:00:00');

                return (
                  <div 
                    key={date} 
                    className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
                      hasSelections ? 'border-2 border-green-400' : ''
                    }`}
                  >
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-800">
                        {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {dateObj.toLocaleDateString('en-US', { weekday: 'long' })}
                      </p>
                    </div>

                    {hasSelections ? (
                      <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {Object.entries(daySelections).map(([item, user]) => (
                          <div key={item} className="bg-green-50 p-2 rounded text-sm">
                            <div className="font-medium text-gray-800 truncate">{item}</div>
                            <div className="text-green-700 text-xs">→ {user}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No selections yet</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUMMARY REPORT VIEW */}
        {view === 'summary' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Summary Report</h2>
            
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {Object.keys(selections).length}
                </div>
                <div className="text-sm text-gray-600">Total Days with Selections</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {Object.values(selections).reduce((sum, day) => sum + Object.keys(day).length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Selections Made</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {new Set(Object.values(selections).flatMap(day => Object.values(day))).size}
                </div>
                <div className="text-sm text-gray-600">Unique Users</div>
              </div>
            </div>

            {/* Popular Items */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Most Popular Menu Items</h3>
              <div className="space-y-2">
                {(() => {
                  const itemCounts = {};
                  Object.values(selections).forEach(day => {
                    Object.keys(day).forEach(item => {
                      itemCounts[item] = (itemCounts[item] || 0) + 1;
                    });
                  });
                  
                  return Object.entries(itemCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([item, count]) => (
                      <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-800">{item}</span>
                        <span className="text-indigo-600 font-bold">{count} times</span>
                      </div>
                    ));
                })()}
              </div>
            </div>

            {/* User Activity */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">User Activity</h3>
              <div className="space-y-2">
                {(() => {
                  const userCounts = {};
                  Object.values(selections).forEach(day => {
                    Object.values(day).forEach(user => {
                      userCounts[user] = (userCounts[user] || 0) + 1;
                    });
                  });
                  
                  return Object.entries(userCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([user, count]) => (
                      <div key={user} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-800">{user}</span>
                        </div>
                        <span className="text-green-600 font-bold">{count} selections</span>
                      </div>
                    ));
                })()}
              </div>
            </div>

            {/* Detailed Timeline */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Complete Timeline</h3>
              <div className="space-y-4">
                {Object.keys(selections).sort().reverse().map(date => {
                  const daySelections = selections[date];
                  const dateObj = new Date(date + 'T00:00:00');
                  
                  return (
                    <div key={date} className="border-l-4 border-indigo-500 pl-4 pb-4">
                      <h4 className="font-bold text-gray-800 mb-2">
                        {dateObj.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h4>
                      <div className="space-y-1">
                        {Object.entries(daySelections).map(([item, user]) => (
                          <div key={item} className="text-sm text-gray-700">
                            <span className="font-medium">{item}</span>
                            <span className="text-gray-500"> → {user}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
