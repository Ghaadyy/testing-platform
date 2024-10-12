using System.Runtime.InteropServices;

namespace RestrictedNL.Compiler;

public static class Parser
{
    private const string _dllImportPath = @"librestricted_nl_lib.dll";

    [DllImport(_dllImportPath, CallingConvention = CallingConvention.Cdecl)]
    public static extern bool parse(string path);
}