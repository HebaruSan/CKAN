using System.Linq;
using System.Collections.Generic;

namespace CKAN.Edge
{

    public class CapturingUser : IUser
    {
        public readonly List<string> Messages  = new List<string>();
        public readonly List<string> Errors    = new List<string>();
        public readonly List<string> Progress  = new List<string>();
        public readonly List<string> Selection = new List<string>();
        public readonly List<string> YesNo     = new List<string>();

        public override string ToString()
        {
            return string.Join("\n", Messages.Concat(Errors));
        }

        public bool Headless { get { return false; } }

        public bool RaiseYesNoDialog(string question)
        {
            YesNo.Add(question);
            return true;
        }

        public int RaiseSelectionDialog(string message, params object[] args)
        {
            Selection.Add(string.Format(message, args));
            return 0;
        }

        public void RaiseError(string message, params object[] args)
        {
            Errors.Add(string.Format(message, args));
        }

        public void RaiseProgress(string message, int percent)
        {
            Progress.Add($"{message} ({percent}%)");
        }

        public void RaiseMessage(string message, params object[] url)
        {
            Messages.Add(string.Format(message, url));
        }

    }

}
