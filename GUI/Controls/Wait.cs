using System;
using System.Collections.Generic;
using System.Drawing;
using System.Windows.Forms;

namespace CKAN
{
    public partial class Wait : UserControl
    {
        public Wait()
        {
            InitializeComponent();
        }

        public event Action OnRetry;
        public event Action OnCancel;

        private const int padding        = 5;
        private const int labelWidth     = 400;
        private const int progressHeight = 20;
        private const int emptyHeight    = 85;

        private Dictionary<CkanModule, Label>       moduleLabels = new Dictionary<CkanModule, Label>();
        private Dictionary<CkanModule, ProgressBar> moduleBars   = new Dictionary<CkanModule, ProgressBar>();

        public bool RetryEnabled
        {
            set
            {
                Util.Invoke(this, () =>
                    RetryCurrentActionButton.Enabled = value);
            }
        }

        public int ProgressValue
        {
            set
            {
                Util.Invoke(this, () =>
                    DialogProgressBar.Value =
                        Math.Max(DialogProgressBar.Minimum,
                            Math.Min(DialogProgressBar.Maximum, value)));
            }
        }

        public bool ProgressIndeterminate
        {
            set
            {
                Util.Invoke(this, () =>
                    DialogProgressBar.Style = value
                        ? ProgressBarStyle.Marquee
                        : ProgressBarStyle.Continuous);
            }
        }

        /// <summary>
        /// React to data received for a module,
        /// adds or updates a label and progress bar so user can see how each download is going
        /// </summary>
        /// <param name="module">The module that is being downloaded</param>
        /// <param name="remaining">Number of bytes left to download</param>
        /// <param name="total">Number of bytes in complete download</param>
        public void SetModuleProgress(CkanModule module, long remaining, long total)
        {
            Util.Invoke(this, () =>
            {
                if (moduleBars.TryGetValue(module, out ProgressBar pb))
                {
                    pb.Value = (int) (100 * (total - remaining) / total);
                }
                else
                {
                    var rowTop = TopPanel.Height - padding;
                    var newLb = new Label()
                    {
                        AutoSize = true,
                        Location = new Point(2 * padding, rowTop),
                        Size     = new Size(labelWidth, progressHeight),
                        Text     = string.Format(
                                Properties.Resources.MainChangesetHostSize,
                                module.name,
                                module.version,
                                module.download.Host ?? "",
                                CkanModule.FmtSize(module.download_size)),
                    };
                    moduleLabels.Add(module, newLb);
                    TopPanel.Controls.Add(newLb);
                    var newPb = new ProgressBar()
                    {
                        Anchor   = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right,
                        Location = new Point(labelWidth + 3 * padding, rowTop),
                        Size     = new Size(TopPanel.Width - labelWidth - 5 * padding, progressHeight),
                        Minimum  = 0,
                        Maximum  = 100,
                        Value    = (int) (100 * (total - remaining) / total),
                        Style    = ProgressBarStyle.Continuous,
                    };
                    moduleBars.Add(module, newPb);
                    TopPanel.Controls.Add(newPb);
                    TopPanel.Height += newPb.Height + padding;
                }
            });
        }

        /// <summary>
        /// React to completion of all downloads,
        /// removes all the module progress bars since we don't need them anymore
        /// </summary>
        public void DownloadsComplete()
        {
            ClearModuleBars();
        }

        private void ClearModuleBars()
        {
            Util.Invoke(this, () =>
            {
                foreach (var kvp in moduleLabels)
                {
                    TopPanel.Controls.Remove(kvp.Value);
                }
                foreach (var kvp in moduleBars)
                {
                    TopPanel.Controls.Remove(kvp.Value);
                }
                moduleLabels.Clear();
                moduleBars.Clear();
                TopPanel.Height = emptyHeight;
            });
        }

        public void Reset(bool cancelable)
        {
            Util.Invoke(this, () =>
            {
                ClearModuleBars();
                ProgressValue = DialogProgressBar.Minimum;
                ProgressIndeterminate = true;
                RetryCurrentActionButton.Enabled = false;
                CancelCurrentActionButton.Enabled = cancelable;
                MessageTextBox.Text = Properties.Resources.MainWaitPleaseWait;
            });
        }

        public void Finish(bool success)
        {
            Util.Invoke(this, () =>
            {
                MessageTextBox.Text = Properties.Resources.MainWaitDone;
                ProgressValue = 100;
                ProgressIndeterminate = false;
                RetryCurrentActionButton.Enabled = !success;
                CancelCurrentActionButton.Enabled = false;
            });
        }

        public void SetDescription(string message)
        {
            Util.Invoke(this, () =>
                MessageTextBox.Text = "(" + message + ")");
        }

        public void ClearLog()
        {
            Util.Invoke(this, () =>
                LogTextBox.Text = "");
        }

        public void AddLogMessage(string message)
        {
            Util.Invoke(this, () =>
                LogTextBox.AppendText(message + "\r\n"));
        }

        private void RetryCurrentActionButton_Click(object sender, EventArgs e)
        {
            if (OnRetry != null)
            {
                OnRetry();
            }
        }

        private void CancelCurrentActionButton_Click(object sender, EventArgs e)
        {
            if (OnCancel != null)
            {
                OnCancel();
            }
            Util.Invoke(this, () =>
                CancelCurrentActionButton.Enabled = false);
        }
    }
}
