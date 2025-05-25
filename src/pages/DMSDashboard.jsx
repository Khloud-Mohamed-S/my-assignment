import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { v4 as uuidv4 } from "uuid";
import "./DMSDashboard.css";

// ----- FileUploadForm Component -----
const FileUploadForm = ({ folders, onUpload }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [folderId, setFolderId] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const allowedTypes = [
    "application/pdf",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/png",
    "image/jpeg",
  ];

  const maxSizeMB = 10;

  const handleSubmit = () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      alert(
        "Unsupported file type. Please upload a PDF, CSV, XLSX, PPTX, PNG, or JPG file."
      );
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File is too large. Max size is ${maxSizeMB}MB.`);
      return;
    }

    if (title.trim()) {
      onUpload(file, { title, description, folderId, tags });
      setFile(null);
      setTitle("");
      setDescription("");
      setFolderId("");
      setTags("");
      setError("");
    } else {
      setError("Title is required.");
    }
  };

  return (
    <div className="file-upload-form p-3 bg-light rounded shadow-sm">
      <div className="form-group mb-3">
        <input
          type="file"
          className="form-control mb-3"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <input
          className="form-control mb-3"
          placeholder="Enter title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim()) {
              setError("");
            }
          }}
        />
        {error && <small className="text-danger">{error}</small>}
      </div>
      <textarea
        className="form-control mb-3"
        placeholder="Description"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <select
        className="form-select mb-3"
        value={folderId}
        onChange={(e) => setFolderId(e.target.value)}
      >
        <option value="">Select Folder (optional)</option>
        {folders.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
      <input
        className="form-control mb-3"
        placeholder="Tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <button className="btn btn-primary w-100" onClick={handleSubmit}>
        Upload File
      </button>
    </div>
  );
};

// ----- TagManager Component -----
function TagManager({ document, onUpdateTags }) {
  const [tagInput, setTagInput] = useState("");

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
    <div className="tag-manager bg-white p-3 rounded shadow-sm">
      <h5 className="mb-3">Tags</h5>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {document.metadata.tags.map((tag) => (
          <span
            key={tag}
            className="badge bg-info text-dark tag-badge"
            style={{ cursor: "pointer" }}
            onClick={() => removeTag(tag)}
            title="Click to remove"
          >
            {tag} &#x2716;
          </span>
        ))}
      </div>
      <div className="d-flex gap-2">
        <input
          className="form-control"
          type="text"
          placeholder="Add tag"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTag()}
        />
        <button className="btn btn-outline-primary" onClick={addTag}>
          Add
        </button>
      </div>
    </div>
  );
}
// ----- RBACManager Component -----
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
    <div className="rbac-manager bg-white p-3 rounded shadow-sm">
      <h5 className="mb-3">Access Control</h5>
      <div className="d-flex flex-column flex-md-row gap-4">
        <div className="d-flex flex-column w-100 w-md-50">
          <select
            className="form-select mb-2"
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
            className="form-select mb-3"
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
            className="btn btn-primary"
          >
            Assign Permission
          </button>
        </div>
        <div className="permissions-list w-100 w-md-50">
          <h6>Current Permissions</h6>
          <ul className="list-group">
            {acl.map((entry) => {
              const user = users.find((u) => u.id === entry.userId);
              return (
                <li
                  key={entry.userId}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {user ? user.name : "Unknown"}
                  <span className="badge bg-secondary">{entry.permission}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ----- FolderForm Component -----
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

  const getParentName = (parentId) => {
    const parent = folders.find((f) => f.id === parentId);
    return parent ? parent.name : "None";
  };

  return (
    <div className="folder-form">
      {!editMode ? (
        <div className="mb-4 p-3 bg-light rounded shadow-sm">
          <input
            className="form-control mb-3"
            placeholder="New Folder Name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
          <select
            className="form-select mb-3"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">No Parent</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <button className="btn btn-success w-100" onClick={handleCreate}>
            Create Folder
          </button>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-light rounded shadow-sm">
          <h5>Edit Folder</h5>
          <input
            className="form-control mb-3"
            placeholder="Folder Name"
            value={editData.name}
            onChange={(e) =>
              setEditData({ ...editData, name: e.target.value })
            }
          />
          <select
            className="form-select mb-3"
            value={editData.parentId}
            onChange={(e) =>
              setEditData({ ...editData, parentId: e.target.value })
            }
          >
            <option value="">No Parent</option>
            {getAvailableParents(editData.id).map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary me-2" onClick={handleEdit}>
            Save
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setEditMode(false)}
          >
            Cancel
          </button>
        </div>
      )}

      <div>
        <h5>Folders</h5>
        <ul className="list-group folder-list">
          {folders.map((folder) => (
            <li
              key={folder.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {folder.name}{" "}
              <small className="text-muted">
                {folder.parentId ? (
                  <span>Parent: {getParentName(folder.parentId)}</span>
                ) : (
                  ""
                )}
              </small>

              <div>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => handleEditOpen(folder)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(folder.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
// ----- Main Documentmanager Component -----
const DMSDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [users] = useState([
    { id: "u1", name: "Khloud" },
    { id: "u2", name: "Mohamed" },
    { id: "u3", name: "Malak" },
    { id: "u4", name: "Arwa" },
  ]);

  const handleDeleteFile = (doc) => {
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  };

  const onUpload = (file, metadata) => {
    const newDoc = {
      id: uuidv4(),
      file,
      metadata: {
        title: metadata.title,
        description: metadata.description,
        folderId: metadata.folderId || null,
        tags: metadata.tags
          ? metadata.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      },
      acl: [],
    };
    setDocuments((prev) => [...prev, newDoc]);
  };

  const onUpdateTags = (docId, newTags) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? { ...doc, metadata: { ...doc.metadata, tags: newTags } }
          : doc
      )
    );
  };

  const onUpdateACL = (docId, newACL) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, acl: newACL } : doc))
    );
  };

  const onAddFolder = (name, parentId) => {
    setFolders((prev) => [...prev, { id: uuidv4(), name, parentId }]);
  };

  const onEditFolder = ({ id, name, parentId }) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name, parentId } : f))
    );
  };

  const onDeleteFolder = (id) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.metadata.folderId === id
          ? { ...doc, metadata: { ...doc.metadata, folderId: null } }
          : doc
      )
    );
    setFolders((prev) =>
      prev.map((f) => (f.parentId === id ? { ...f, parentId: null } : f))
    );
  };

  const selectedDoc = documents.find((doc) => doc.id === selectedDocId);

  return (
    <div className="container my-4">
      <h2
        className="mb-4 text-primary text-center"
        style={{
          fontFamily: "'Georgia', serif",
          color: "#4a90e2",
          fontWeight: "bold",
        }}
      >
        Document Manager
      </h2>

      <div className="row g-4">
        <div className="col-lg-4">
          <FileUploadForm folders={folders} onUpload={onUpload} />
          <FolderForm
            folders={folders}
            onAddFolder={onAddFolder}
            onEditFolder={onEditFolder}
            onDeleteFolder={onDeleteFolder}
          />
        </div>

        <div className="col-lg-8">
          <h4 className="mb-3">Documents</h4>
          <ul
            className="list-group document-list"
            style={{ maxHeight: "80vh", overflowY: "auto" }}
          >
            {documents.length === 0 && (
              <li className="list-group-item">
                No documents uploaded yet.
              </li>
            )}
            {documents.map((doc) => {
              const isSelected = selectedDocId === doc.id;
              return (
                <li key={doc.id} className="list-group-item">
                  <div
                    onClick={() =>
                      setSelectedDocId((prevId) =>
                        prevId === doc.id ? null : doc.id
                      )
                    }
                    style={{ cursor: "pointer" }}
                    className={`p-2 ${
                      isSelected ? "bg-light border border-primary" : ""
                    }`}
                  >
                    <strong>{doc.metadata.title}</strong>
                    <br />
                    <small className="text-muted">
                      {doc.metadata.description || "No description"}
                    </small>
                    <br />
                    <small>
                      Folder:{" "}
                      {doc.metadata.folderId
                        ? folders.find((f) => f.id === doc.metadata.folderId)
                            ?.name || "Unknown"
                        : "None"}
                    </small>
                  </div>

                  {isSelected && (
                    <div className="mt-3 bg-white p-3 rounded shadow-sm">
                      <TagManager
                        document={doc}
                        onUpdateTags={(newTags) =>
                          onUpdateTags(doc.id, newTags)
                        }
                      />
                      <hr />
                      <RBACManager
                        acl={doc.acl}
                        users={users}
                        onUpdateACL={(newACL) => onUpdateACL(doc.id, newACL)}
                      />
                      <hr />
                      <button
                        onClick={() => handleDeleteFile(doc)}
                        className="btn btn-danger w-100"
                      >
                        Delete File
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DMSDashboard;
