import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { API_URL } from '../../../config';
import { getToken } from '../../../auth';
import MessageEditor from '../editor/MessageEditor';
import { useToast } from '../../contexts/ToastContext';
import { useLocale } from '../../contexts/LocaleContext';

function ContractNotesTab({ currentContract, onContractUpdate }) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const { t } = useLocale();
  const token = getToken();

  const handleEditNotes = () => {
    const currentNotes = currentContract?.notes || currentContract?.general_notes || '';
    setEditedNotes(currentNotes);
    setEditingNotes(true);
  };

  const handleSaveNotes = async () => {
    if (!currentContract?.id || !currentContract?.project_id || !currentContract?.lot_id) {
      showToast(t('contractNotes.incompleteContract'), 'error');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${currentContract.project_id}/lots/${currentContract.lot_id}/contracts/${currentContract.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            contract: {
              notes: editedNotes.trim()
            }
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      // Call the parent update callback if provided
      if (onContractUpdate) {
        onContractUpdate({
          ...currentContract,
          notes: editedNotes.trim()
        });
      }

      setEditingNotes(false);
      showToast(t('contractNotes.notesUpdated'), 'success');
    } catch (error) {
      console.error('Error updating contract notes:', error);
      showToast(`${t('contractNotes.updateError')}: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingNotes(false);
    setEditedNotes('');
  };

  const notes = [
    {
      type: 'general',
      title: t('contractNotes.generalNotes'),
      content: currentContract?.notes || currentContract?.general_notes || t('contractNotes.noGeneralNotes'),
      icon: '📝',
      color: 'blue',
      editable: true
    },
    {
      type: 'rejection',
      title: t('contractNotes.rejectionReason'),
      content: currentContract?.rejection_reason || t('contractNotes.notApplicable'),
      icon: '❌',
      color: 'red',
      show: !!currentContract?.rejection_reason
    },
    {
      type: 'cancellation',
      title: t('contractNotes.cancellationNotes'),
      content: currentContract?.cancellation_notes || t('contractNotes.notApplicable'),
      icon: '🚫',
      color: 'yellow',
      show: !!currentContract?.cancellation_notes
    },
    {
      type: 'special_conditions',
      title: t('contractNotes.specialConditions'),
      content: currentContract?.special_conditions || currentContract?.conditions || t('contractNotes.noSpecialConditions'),
      icon: '⚠️',
      color: 'orange'
    }
  ].filter(note => note.show !== false);

  return (
    <div className="space-y-6">
      {/* Notes Sections */}
      <div className="space-y-4">
        {notes.map((note, _index) => (
          <div key={note.type} className="bg-white dark:bg-darkblack-600 rounded-lg border border-bgray-200 dark:border-darkblack-400 overflow-hidden">
            <div className={`px-6 py-4 border-b border-bgray-200 dark:border-darkblack-400 ${note.color === 'red' ? 'bg-red-50 dark:bg-red-900/20' :
                note.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                  note.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20' :
                    'bg-blue-50 dark:bg-blue-900/20'
              }`}>
              <div className="flex items-center">
                <span className="text-lg mr-3">{note.icon}</span>
                <h4 className={`font-semibold ${note.color === 'red' ? 'text-red-800 dark:text-red-200' :
                    note.color === 'yellow' ? 'text-yellow-800 dark:text-yellow-200' :
                      note.color === 'orange' ? 'text-orange-800 dark:text-orange-200' :
                        'text-blue-800 dark:text-blue-200'
                  }`}>
                  {note.title}
                </h4>
              </div>
            </div>
            <div className="px-6 py-4">
              {note.editable && editingNotes ? (
                <div className="space-y-3">
                  <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-darkblack-400">
                    <MessageEditor onTextChange={setEditedNotes} initialValue={editedNotes} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-darkblack-500 dark:hover:bg-darkblack-400 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                    >
                      {t('contractNotes.cancel')}
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      disabled={saving || editedNotes.trim() === (currentContract?.notes || currentContract?.general_notes || '')}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? t('contractNotes.saving') : t('contractNotes.save')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-sm text-bgray-700 dark:text-bgray-300">
                    {note.content === t('contractNotes.noGeneralNotes') || note.content === t('contractNotes.notApplicable') ? (
                      <span className="whitespace-pre-wrap">{note.content}</span>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: note.content }} />
                    )}
                  </div>
                  {note.editable && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={handleEditNotes}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-darkblack-500 dark:hover:bg-darkblack-400 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {t('contractNotes.edit')}
                      </button>
                    </div>
                  )}
                  {note.content === t('contractNotes.noGeneralNotes') ||
                    note.content === t('contractNotes.noSpecialConditions') ||
                    note.content === t('contractNotes.notApplicable') ? (
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic">
                      {t('contractNotes.sectionNoInfo')}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
              {t('contractNotes.additionalInfo')}
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t('contractNotes.contractNotesDescription')}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

ContractNotesTab.propTypes = {
  currentContract: PropTypes.object,
  onContractUpdate: PropTypes.func,
};

export default memo(ContractNotesTab);