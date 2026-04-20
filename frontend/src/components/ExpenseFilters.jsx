import React from "react";
import Input from "./ui/Input";

const ExpenseFilters = ({ filters, setFilters, categories }) => {
  return (
    <div 
      className="filters" 
      style={{ 
        display: "grid", 
        gap: "10px", 
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
        marginBottom: "20px" 
      }}
    >
      {/* Search */}
      <Input
        type="text"
        placeholder="Search by title..."
        value={filters.search}
        onChange={(e) =>
          setFilters({ ...filters, search: e.target.value })
        }
      />

      {/* Category Filter */}
      <select
        value={filters.category}
        onChange={(e) =>
          setFilters({ ...filters, category: e.target.value })
        }
      >
        <option value="">All Categories</option>
        {categories?.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={filters.sort}
        onChange={(e) =>
          setFilters({ ...filters, sort: e.target.value })
        }
      >
        <option value="">Sort By</option>
        <option value="date_desc">Newest First</option>
        <option value="date_asc">Oldest First</option>
        <option value="amount_desc">High → Low</option>
        <option value="amount_asc">Low → High</option>
      </select>
    </div>
  );
};

export default ExpenseFilters;
