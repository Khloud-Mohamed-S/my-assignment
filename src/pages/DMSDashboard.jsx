// src/pages/DMSDashboard.jsx
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { v4 as uuidv4 } from "uuid";
import "../pages/DMSDashboard.css";
const defaultUsers = [
  { id: "alice", name: "alice" },
  { id: "boob", name: "boob" },
  { id: "john", name: "john" },
];

const DMSDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [docsOpen, setDocsOpen] = useState(true);

  const updateTags = (docId, newTags) =>
    setDocuments((docs) =>
      docs.map((doc) =>
        doc.id === docId
          ? { ...doc, metadata: { ...doc.metadata, tags: newTags } }
          : doc
      )
    );

  const updateACL = (docId, newACL) =>
    setDocuments((docs) =>
      docs.map((doc) => (doc.id === docId ? { ...doc, acl: newACL } : doc))
    );

  const selectedDoc = documents.find((d) => d.id === selectedDocId);

  const handleFileUpload = (file, metadata) => {
    const newDoc = {
      id: Date.now(),
      file,
      metadata: {
        title: metadata.title,
        description: metadata.description,
        folderId: metadata.folderId || null,
        tags: metadata.tags.split(",").map((tag) => tag.trim()),
      },
      acl: defaultUsers.map((user) => ({
        userId: user.id,
        permission: "view",
      })),
    };
    setDocuments((prev) => [...prev, newDoc]);
  };

  const handleAddFolder = (name, parentId = null) => {
    const newFolder = {
      id: uuidv4(),
      name,
      parentId,
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const handleEditFolder = (updatedFolder) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === updatedFolder.id ? updatedFolder : folder
      )
    );
  };

  const handleDeleteFolder = (id) => {
    const collectDescendants = (folderId) => {
      let descendants = [folderId];
      const children = folders.filter((f) => f.parentId === folderId);
      for (let child of children) {
        descendants = descendants.concat(collectDescendants(child.id));
      }
      return descendants;
    };
    const allToDelete = collectDescendants(id);
    setFolders((prev) =>
      prev.filter((folder) => !allToDelete.includes(folder.id))
    );
  };
  const getFullFolderPath = (folderId) => {
    const folderPath = [];
    let current = folders.find((f) => f.id === folderId);
    while (current) {
      folderPath.unshift(current.name);
      current = folders.find((f) => f.id === current.parentId);
    }
    return folderPath.join(" / ");
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Document Management Dashboard</h1>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">File Upload</div>
            <div className="card-body">
              <FileUploadForm folders={folders} onUpload={handleFileUpload} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Folder Management</div>
            <div className="card-body">
              <FolderForm
                folders={folders}
                onAddFolder={handleAddFolder}
                onEditFolder={handleEditFolder}
                onDeleteFolder={handleDeleteFolder}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="mb-3">Documents Overview</h4>

        <div className="card">
          <div
            className="card-header d-flex justify-content-between align-items-center cursor-pointer"
            onClick={() => setDocsOpen((o) => !o)}
          >
            <h5 className="mb-0">Documents</h5>
            <span>{docsOpen ? "▼" : "►"}</span>
          </div>

          {docsOpen && (
            <div className="card-body">
              {documents.length === 0 ? (
                <p className="text-muted">No documents uploaded yet.</p>
              ) : (
                <ul className="list-group">
                  {documents.map((doc) => (
                    <li
                    
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`list-group-item list-group-item-action mt-3  ${
                        selectedDocId === doc.id ? "active text-black bg-light " : ""
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      {doc.metadata.title || doc.file.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {selectedDoc && (
          <div className="card mt-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3 manage-header">
                <i className="bi bi-file-earmark-text-fill me-2 "></i>
                Manage Document:{" "}
              <span class="value">  
                {selectedDoc.metadata.title || selectedDoc.file.name}</span>
              </h5>
              <table class="table">
                <tbody>
                  <tr>
                    <th scope="row">Description</th>
                    <td>
                      <span className="text-muted">
                        {selectedDoc.metadata.description || "N/A"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row"> Folder:</th>
                    <td>
                      {" "}
                      <span className="text-muted">
                        {selectedDoc.metadata.folderId
                          ? getFullFolderPath(selectedDoc.metadata.folderId)
                          : "No folder assigned"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Tags:</th>
                    <td>
                      {" "}
                      {selectedDoc.metadata.tags &&
                      selectedDoc.metadata.tags.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {selectedDoc.metadata.tags.map((tag, idx) => (
                            <span key={idx} className="badge bg-primary">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">No tags</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">ACL:</th>
                    <td>
                      {" "}
                      {selectedDoc.acl && selectedDoc.acl.length > 0 ? (
                        <ul className="list-unstyled ms-2">
                          {selectedDoc.acl.map((entry, idx) => (
                            <li key={idx}>
                              <i className="bi bi-person-fill me-3"></i>
                              {entry.userId}{" "}
                              <span className="badge bg-secondary">
                                {entry.permission}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted">No ACL</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              <hr className="my-4" />

              <div className="mb-4">
                <h4 className="mb-2">Manage Tags</h4>
                <TagManager
                  document={selectedDoc}
                  onUpdateTags={(tags) => updateTags(selectedDoc.id, tags)}
                />
              </div>
              <hr className="my-4" />
              <div>
                <h4 className="mb-2">Manage Access Control</h4>
                <RBACManager
                  acl={selectedDoc.acl}
                  users={defaultUsers}
                  onUpdateACL={(acl) => updateACL(selectedDoc.id, acl)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FileUploadForm = ({ folders, onUpload }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [folderId, setFolderId] = useState("");
  const [tags, setTags] = useState("");
  const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
  const maxSizeMB = 10; // e.g., 5MB

  const handleSubmit = () => {
      if (!allowedTypes.includes(file.type)) {
    alert("Unsupported file type. Please upload a PDF, PNG, or JPG.");
    return;
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    alert(`File is too large. Max size is ${maxSizeMB}MB.`);
    return;
  }
    if (file && title) {
      onUpload(file, { title, description, folderId, tags });
      setFile(null);
      setTitle("");
      setDescription("");
      setFolderId("");
      setTags("");
    }
  };

  return (
    <>
      <input
        type="file"
        className="form-control mb-2"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <input
        className="form-control mb-2"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="form-control mb-2"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <select
        className="form-control mb-2"
        value={folderId}
        onChange={(e) => setFolderId(e.target.value)}
      >
        <option value="">Select Folder</option>
        {folders.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
      <input
        className="form-control mb-2"
        placeholder="Tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <button className="btn btn-primary" onClick={handleSubmit}>
        Upload
      </button>
    </>
  );
};

function TagManager({ document, onUpdateTags }) {
  const [tagInput, setTagInput] = React.useState("");
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !document.metadata.tags.includes(tag)) {
      onUpdateTags([...document.metadata.tags, tag]);
      setTagInput("");
    }
  };
  const removeTag = (tagToRemove) => {
    onUpdateTags(document.metadata.tags.filter((t) => t !== tagToRemove));
  };
  return (
    <div className="tag-manager">
     <div class="tag-section"> <h4 class="mt-3">Tags</h4>
      <div class="inner-tag">
        <div class="mt-3">
        {document.metadata.tags.map((tag) => (
          <span key={tag} className="tag" onClick={() => removeTag(tag)}>
            {tag} &#x2716;
          </span>
        ))}
      </div>
      <div class="d-flex mt-4">
        <input
          className="form-control mb-2 w-50 me-4"
          type="text"
          placeholder="Add tag"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTag()}
        />
        <button onClick={addTag} className="btn btn-primary" id="buttontag">
          Add Tag
        </button>
      </div>
      </div>
      </div>
    </div>
  );
}

function RBACManager({ acl, users, onUpdateACL }) {
  const [selectedUser, setSelectedUser] = React.useState("");
  const [permission, setPermission] = React.useState("view");
  const addPermission = () => {
    if (!selectedUser) return;
    const filteredACL = acl.filter((entry) => entry.userId !== selectedUser);
    filteredACL.push({ userId: selectedUser, permission });
    onUpdateACL(filteredACL);
    setSelectedUser("");
    setPermission("view");
  };
  return (
    <div className="rbac-manager">
      <h4 class="access-header">Access Control</h4>
      <div class="d-flex justify-content-around	">
        <div class="w-50">
          <select
            class="form-select w-50 mt-3"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Select User</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <select
            class=" form-select w-50 mt-2"
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
          >
            <option value="view">View</option>
            <option value="edit">Edit</option>
            <option value="download">Download</option>
          </select>
          <button
            onClick={addPermission}
            disabled={!selectedUser}
            className="btn btn-primary my-3"
          >
            Assign Permission
          </button>
        </div>
        <div class="permission">
          <h5>Current Permissions</h5>
          <ul>
            {acl.map((entry) => {
              const user = users.find((u) => u.id === entry.userId);
              return (
                <li key={entry.userId}>
                  {user ? user.name : "Unknown"}: {entry.permission}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

const FolderForm = ({ folders, onAddFolder, onEditFolder, onDeleteFolder }) => {
  const [folderName, setFolderName] = useState("");
  const [parentId, setParentId] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ id: "", name: "", parentId: "" });

  const handleCreate = () => {
    if (folderName.trim()) {
      onAddFolder(folderName.trim(), parentId || null);
      setFolderName("");
      setParentId("");
    }
  };

  const handleEdit = () => {
    if (editData.name.trim()) {
      onEditFolder({
        id: editData.id,
        name: editData.name.trim(),
        parentId: editData.parentId || null,
      });
      setEditMode(false);
      setEditData({ id: "", name: "", parentId: "" });
    }
  };

  const handleEditOpen = (folder) => {
    setEditMode(true);
    setEditData({
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId || "",
    });
  };

  const handleDelete = (id) => {
    onDeleteFolder(id);
  };

  const getParentName = (parentId) => {
    const parent = folders.find((f) => f.id === parentId);
    return parent ? parent.name : "None";
  };

  const collectDescendants = (folderId) => {
    let descendants = [folderId];
    const children = folders.filter((f) => f.parentId === folderId);
    for (let child of children) {
      descendants = descendants.concat(collectDescendants(child.id));
    }
    return descendants;
  };

  const getAvailableParents = (currentId) => {
    const invalidIds = currentId ? collectDescendants(currentId) : [];
    return folders.filter((f) => !invalidIds.includes(f.id));
  };

  return (
    <>
      {!editMode ? (
        <>
          <input
            className="form-control mb-2"
            placeholder="New Folder Name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
          <select
            className="form-control mb-2"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">Select Parent Folder (optional)</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary mb-3" onClick={handleCreate}>
            Add Folder
          </button>
        </>
      ) : (
        <div className="mb-3 border p-3">
          <h5>Edit Folder</h5>
          <input
            className="form-control mb-2"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          />
          <select
            className="form-control mb-2"
            value={editData.parentId}
            onChange={(e) =>
              setEditData({ ...editData, parentId: e.target.value })
            }
          >
            <option value="">Select Parent Folder (optional)</option>
            {getAvailableParents(editData.id).map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary me-2" onClick={handleEdit}>
            Save
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setEditMode(false);
              setEditData({ id: "", name: "", parentId: "" });
            }}
          >
            Cancel
          </button>
        </div>
      )}

      <ul className="list-group">
        {folders.map((folder) => (
          <li
            key={folder.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{folder.name}</strong> (Parent:{" "}
              {getParentName(folder.parentId)})
            </div>
            <div>
              <button
                className="btn btn-sm btn-primary me-2"
                onClick={() => handleEditOpen(folder)}
              >
                Edit
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(folder.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default DMSDashboard;
